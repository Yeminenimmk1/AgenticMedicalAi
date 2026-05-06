package com.medicalai.service;

import com.medicalai.dto.DiagnosisResponseDTO;
import com.medicalai.dto.SymptomRequestDTO;
import com.medicalai.entity.DiagnosisLog;
import com.medicalai.entity.Patient;
import com.medicalai.repository.DiagnosisLogRepository;
import com.medicalai.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Orchestrator Service.
 * Acts as the "Traffic Cop" routing data to the Python ML microservice
 * and the Spring AI Multi-Agent Medical Board.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DiagnosisOrchestrationService {

    private final MedicalBoardService medicalBoardService;
    private final EmergencyRulesService emergencyRulesService;
    private final PatientRepository patientRepository;
    private final DiagnosisLogRepository diagnosisLogRepository;
    private final WebClient webClient;
    private final VitalsExtractorService vitalsExtractorService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private EmailNotificationService emailService;

    @Transactional
    public DiagnosisResponseDTO triagePatient(SymptomRequestDTO request) {
        log.info("Starting Triage for patient username: {}", request.getUsername());

        // 1. Fetch Patient Context
        Patient patient = patientRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found"));

        // 2. Run Python ML Models (Digital Twin Risk)
        // We do this by hitting our FastAPI server predicting the risk
        Map<String, Object> mlRiskScores = fetchRiskScoresFromPython(patient, request);

        // Save updated risk scores back to DB
        patient.setDiabetesRiskScore(((Number) mlRiskScores.getOrDefault("diabetes_risk_percent", 0.0)).doubleValue());
        patient.setHeartRiskScore(((Number) mlRiskScores.getOrDefault("heart_risk_percent", 0.0)).doubleValue());
        patientRepository.save(patient);
        log.info("Digital Twin ML models executed. Risk updated.");

        // 3. Trigger Spring AI Multi-Doctor Debate
        // Task 2: Advanced Contextual Diagnosis
        String patientContext = String.format(
            "Patient History: Age %d, Gender %s, Blood Group %s, Location/Village %s. \nML Risk Baselines: %.1f%% Diabetes, %.1f%% Heart Disease.",
            patient.getAge(), 
            patient.getGender() != null ? patient.getGender() : "Unknown", 
            patient.getBloodGroup() != null ? patient.getBloodGroup() : "Unknown",
            patient.getVillageZip() != null ? patient.getVillageZip() : "Unknown",
            patient.getDiabetesRiskScore(), patient.getHeartRiskScore()
        );
        String fullPrompt = "Current Symptoms: " + request.getSymptoms() + "\n\n[CRITICAL CONTEXT - MUST CROSS-REFERENCE]:\n" + patientContext;
        
        Map<String, Object> aiResult = medicalBoardService.conductMedicalBoardReview(fullPrompt);

        // 4. Save to Database
        DiagnosisLog logEntry = new DiagnosisLog();
        logEntry.setPatient(patient);
        logEntry.setSymptomsInput(request.getSymptoms());
        
        logEntry.setFeverAgentOutput((String) aiResult.get("fever_agent_output"));
        logEntry.setInfectionAgentOutput((String) aiResult.get("infection_agent_output"));
        logEntry.setHeartAgentOutput((String) aiResult.get("heart_agent_output"));
        
        logEntry.setFinalDiagnosis((String) aiResult.get("final_diagnosis"));
        logEntry.setConfidenceScore((Double) aiResult.get("confidence_score"));
        
        Boolean isEmergency = (Boolean) aiResult.get("emergency_flag");
        logEntry.setEmergencyFlag(isEmergency);

        // 5. Emergency Auto-Escalation Check
        boolean escalated = false;
        if (Boolean.TRUE.equals(isEmergency)) {
            escalated = emergencyRulesService.triggerEmergencyProtocol(patient, logEntry.getFinalDiagnosis());
        }
        logEntry.setEmergencyEscalated(escalated);
        
        diagnosisLogRepository.save(logEntry);

        // 6. Map to Response DTO
        DiagnosisResponseDTO response = new DiagnosisResponseDTO(
                logEntry.getId().toString(),
                logEntry.getFinalDiagnosis(),
                logEntry.getConfidenceScore(),
                logEntry.getEmergencyFlag(),
                escalated,
                (String) aiResult.get("reasoning"),
                patient.getDiabetesRiskScore(),
                patient.getHeartRiskScore(),
                ((Number) mlRiskScores.getOrDefault("overall_health_score", 100.0)).doubleValue(),
                aiResult
        );

        // 7. Fire async email notification to patient (if email service is available)
        if (emailService != null) {
            emailService.sendTriageResultEmail(
                    patient.getEmail(),
                    patient.getFullName() != null ? patient.getFullName() : patient.getUsername(),
                    logEntry.getFinalDiagnosis(),
                    logEntry.getConfidenceScore() != null ? logEntry.getConfidenceScore() : 0.0,
                    (String) aiResult.getOrDefault("reasoning", "See your portal for details."),
                    Boolean.TRUE.equals(isEmergency)
            );
        }

        return response;
    }

    private Map<String, Object> fetchRiskScoresFromPython(Patient patient, SymptomRequestDTO request) {
        try {
            // Build vitals payload — explicit user inputs take top priority.
            // AI-extraction from symptoms is only used when the user left the fields blank.
            Map<String, Object> payload = new HashMap<>();

            // ── Always-present fields from patient profile ───────────────
            payload.put("age", patient.getAge() != null ? patient.getAge() : 40);
            payload.put("sex", "Male".equalsIgnoreCase(patient.getGender()) ? 1 : 0);

            boolean userProvidedVitals = request.getCurrentGlucose() != null
                    || request.getCurrentBloodPressure() != null
                    || request.getCurrentBmi() != null;

            if (userProvidedVitals) {
                // ── PATH A: User entered explicit vitals → use them directly ──
                // This is the fast, reliable path. No LLM call needed.
                log.info("VitalsExtractor: Using EXPLICIT user-entered vitals for Digital Twin.");

                // Core vitals — use user value if provided, otherwise safe default
                payload.put("glucose",        request.getCurrentGlucose()       != null ? request.getCurrentGlucose()       : 90);
                payload.put("blood_pressure", request.getCurrentBloodPressure() != null ? request.getCurrentBloodPressure()  : 75);
                payload.put("bmi",            request.getCurrentBmi()            != null ? request.getCurrentBmi()            : 23.0);

                // Derive additional cardiac features from symptom keywords
                String sym = request.getSymptoms() != null ? request.getSymptoms().toLowerCase() : "";
                payload.put("chest_pain_type",           sym.matches(".*(chest pain|crushing|angina|pressure in chest).*") ? 4 : 1);
                payload.put("exercise_induced_angina",   sym.matches(".*(breathless|shortness of breath|exertion).*")      ? 1 : 0);
                payload.put("st_depression",             sym.matches(".*(chest pain|crushing|angina).*")                    ? 2.5 : 0.0);
                payload.put("fasting_blood_sugar_gt120", request.getCurrentGlucose() != null && request.getCurrentGlucose() > 120 ? 1 : 0);
                payload.put("cholesterol",               sym.matches(".*(high cholesterol|cholesterol).*")                  ? 280 : 185);
                payload.put("max_heart_rate",            sym.matches(".*(palpitation|racing heart|tachycardia).*")          ? 175 : 150);
                payload.put("diabetes_pedigree_function",request.getCurrentGlucose() != null && request.getCurrentGlucose() > 140 ? 1.2 : 0.3);

            } else {
                // ── PATH B: No explicit vitals → use AI extraction from symptoms + history ──
                log.info("VitalsExtractor: No explicit vitals — using AI extraction from symptoms.");
                List<DiagnosisLog> history = diagnosisLogRepository
                        .findByPatientIdOrderByCreatedAtDesc(patient.getId());
                Map<String, Object> extracted = vitalsExtractorService.extractVitals(
                        request.getSymptoms(), history, patient);

                payload.put("glucose",                   extracted.getOrDefault("glucose",                   90));
                payload.put("blood_pressure",            extracted.getOrDefault("blood_pressure",            75));
                payload.put("bmi",                       extracted.getOrDefault("bmi",                       23.0));
                payload.put("chest_pain_type",           extracted.getOrDefault("chest_pain_type",           1));
                payload.put("exercise_induced_angina",   extracted.getOrDefault("exercise_induced_angina",   0));
                payload.put("st_depression",             extracted.getOrDefault("st_depression",             0.0));
                payload.put("fasting_blood_sugar_gt120", extracted.getOrDefault("fasting_blood_sugar_gt120", 0));
                payload.put("cholesterol",               extracted.getOrDefault("cholesterol",               185));
                payload.put("max_heart_rate",            extracted.getOrDefault("max_heart_rate",            150));
                payload.put("diabetes_pedigree_function",extracted.getOrDefault("diabetes_pedigree_function",0.3));
            }

            log.info("Sending vitals to Python ML: glucose={}, bp={}, bmi={}, chest_pain={}, angina={}, st_dep={}",
                    payload.get("glucose"), payload.get("blood_pressure"), payload.get("bmi"),
                    payload.get("chest_pain_type"), payload.get("exercise_induced_angina"), payload.get("st_depression"));

            return webClient.post()
                    .uri("http://localhost:8000/api/ml/predict-risk")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

        } catch (Exception ex) {
            log.error("Failed to connect to Python ML Microservice. Falling back to defaults.", ex);
            return Map.of(
                    "diabetes_risk_percent", 0.0,
                    "heart_risk_percent",    0.0,
                    "overall_health_score",  100.0
            );
        }

    }
}
