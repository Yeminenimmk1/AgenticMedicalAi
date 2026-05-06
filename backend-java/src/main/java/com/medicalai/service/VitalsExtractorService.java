package com.medicalai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicalai.entity.DiagnosisLog;
import com.medicalai.entity.Patient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * VitalsExtractorService — AI-Powered Vital Signs Estimator
 *
 * Uses the LLM (Groq/Llama) to read a patient's symptom text and recent
 * diagnosis history, then estimates structured medical vital parameters (glucose,
 * blood pressure, BMI, chest pain type, etc.) as a JSON object.
 *
 * These extracted vitals are then passed to the Python ML microservice so that
 * the Digital Twin risk chart reflects the patient's CURRENT health state
 * rather than static hardcoded defaults.
 */
@Slf4j
@Service
public class VitalsExtractorService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    // -----------------------------------------------------------------
    // The Vitals Extraction Prompt
    // Instructs the LLM to output ONLY a JSON object with vital estimates.
    // -----------------------------------------------------------------
    private static final String VITALS_EXTRACTION_PROMPT = """
        You are a Medical Vitals Estimator AI. Your ONLY job is to analyze a patient's \
        current symptoms and their recent diagnosis history, then output realistic estimated \
        medical vitals as a JSON object.

        === CURRENT SYMPTOMS ===
        %s

        === RECENT DIAGNOSIS HISTORY (last 5 visits) ===
        %s

        === INSTRUCTIONS ===
        Based on the symptoms and history above, return ONLY a valid JSON object with these
        estimated vital values. No explanations. No markdown. Just the raw JSON object.

        {
          "glucose": <int, normal=90, pre-diabetic=120-140, diabetic=160-250>,
          "blood_pressure": <int diastolic, normal=75, elevated=85-95, hypertension=95-120>,
          "bmi": <float, healthy=18-24.9, overweight=25-29.9, obese=30-45>,
          "chest_pain_type": <int 1-4: 1=no pain, 2=atypical, 3=non-anginal, 4=severe angina>,
          "cholesterol": <int, normal=170-200, borderline=200-240, high=240-400>,
          "max_heart_rate": <int, normal=140-160, low_cardiac=100-130, tachycardia=170-195>,
          "exercise_induced_angina": <int 0 or 1, 1 if breathless or chest pain during exertion>,
          "st_depression": <float 0.0-5.0, 0.0=healthy, 2.0-4.0=significant cardiac concern>,
          "fasting_blood_sugar_gt120": <int 0 or 1, 1 if fasting blood sugar is high>,
          "diabetes_pedigree_function": <float 0.1-2.5, higher if family history or recurring diabetic diagnoses>
        }

        === VITAL ESTIMATION RULES ===
        DIABETES INDICATORS:
        - "high blood sugar", "diabetic", "sweet urine", "frequent urination", "excessive thirst", "polydipsia"
          → glucose: 165-250, fasting_blood_sugar_gt120: 1, diabetes_pedigree_function: 1.0-2.0

        CARDIAC INDICATORS:
        - "chest pain", "crushing pressure", "pressure in chest", "angina", "chest tightness"
          → chest_pain_type: 3-4, st_depression: 1.5-3.5
        - "shortness of breath on exertion", "can't walk without breathlessness", "dyspnea"
          → exercise_induced_angina: 1
        - "palpitations", "racing heart", "fast heartbeat", "heart pounding"
          → max_heart_rate: 165-190
        - "high blood pressure", "hypertension", "BP is high"
          → blood_pressure: 92-115
        - "high cholesterol", "fatty diet", "hypercholesterolemia"
          → cholesterol: 260-380

        OBESITY / METABOLIC INDICATORS:
        - "overweight", "obese", "gained a lot of weight"
          → bmi: 28-40, cholesterol: 220-300

        HISTORY-BASED ADJUSTMENTS (check recent diagnosis history):
        - If 2+ recent diagnoses involve "Heart", "Cardiac", "Angina", or "Hypertension"
          → increase chest_pain_type by +1, add +30 to cholesterol, st_depression +0.5
        - If 2+ recent diagnoses involve "Diabetes", "Diabetic", or "Glucose"
          → increase glucose by +25, diabetes_pedigree_function +0.4, fasting_blood_sugar_gt120=1

        NORMAL/BASELINE (when symptoms are mild or unrelated to above):
        - "mild headache", "runny nose", "cold", "cough", "sneezing", "fever"
          → all values near normal baseline
        - "completely fine", "routine checkup", "no symptoms"
          → all values at normal baseline
        """;

    public VitalsExtractorService(ChatClient.Builder chatClientBuilder, ObjectMapper objectMapper) {
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Main entry point. Given symptoms text and patient diagnosis history,
     * extracts estimated vitals using the LLM and returns them as a map.
     *
     * @param symptoms The raw symptom text entered by the patient
     * @param history  The patient's recent diagnosis logs from the database
     * @param patient  The patient entity (for any static context if needed)
     * @return A map of vital field names to their estimated values
     */
    public Map<String, Object> extractVitals(String symptoms, List<DiagnosisLog> history, Patient patient) {
        log.info("VitalsExtractor: Starting dynamic vital estimation for patient '{}'", patient.getUsername());

        String historySummary = buildHistorySummary(history);
        String prompt = String.format(VITALS_EXTRACTION_PROMPT, symptoms, historySummary);

        try {
            String rawResponse = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            // Clean up any markdown code fences the LLM might add
            String cleanJson = rawResponse;
            if (cleanJson.contains("```json")) {
                cleanJson = cleanJson.replaceAll("```json", "").replaceAll("```", "").trim();
            } else if (cleanJson.contains("```")) {
                cleanJson = cleanJson.replaceAll("```", "").trim();
            }

            // Extract only the JSON object portion (from first { to last })
            int start = cleanJson.indexOf('{');
            int end   = cleanJson.lastIndexOf('}');
            if (start != -1 && end != -1 && end > start) {
                cleanJson = cleanJson.substring(start, end + 1);
            }

            JsonNode vitalsNode = objectMapper.readTree(cleanJson);

            Map<String, Object> result = new HashMap<>();
            result.put("glucose",                    vitalsNode.path("glucose").asInt(90));
            result.put("blood_pressure",             vitalsNode.path("blood_pressure").asInt(75));
            result.put("bmi",                        vitalsNode.path("bmi").asDouble(23.0));
            result.put("chest_pain_type",            vitalsNode.path("chest_pain_type").asInt(1));
            result.put("cholesterol",                vitalsNode.path("cholesterol").asInt(185));
            result.put("max_heart_rate",             vitalsNode.path("max_heart_rate").asInt(150));
            result.put("exercise_induced_angina",    vitalsNode.path("exercise_induced_angina").asInt(0));
            result.put("st_depression",              vitalsNode.path("st_depression").asDouble(0.0));
            result.put("fasting_blood_sugar_gt120",  vitalsNode.path("fasting_blood_sugar_gt120").asInt(0));
            result.put("diabetes_pedigree_function", vitalsNode.path("diabetes_pedigree_function").asDouble(0.3));

            log.info("VitalsExtractor: glucose={}, bp={}, bmi={}, chest_pain_type={}, cholesterol={}, max_hr={}, angina={}, st_dep={}",
                    result.get("glucose"), result.get("blood_pressure"), result.get("bmi"),
                    result.get("chest_pain_type"), result.get("cholesterol"), result.get("max_heart_rate"),
                    result.get("exercise_induced_angina"), result.get("st_depression"));

            return result;

        } catch (Exception e) {
            log.error("VitalsExtractor: Failed to parse vitals JSON. Using safe baseline fallback. Error: {}", e.getMessage());
            return getBaselineVitals();
        }
    }

    /**
     * Formats the last 5 diagnosis logs into a readable history string for the LLM prompt.
     */
    private String buildHistorySummary(List<DiagnosisLog> history) {
        if (history == null || history.isEmpty()) {
            return "No previous diagnosis history. This appears to be the patient's first visit.";
        }

        return history.stream()
                .limit(5)
                .map(entry -> String.format("  - [%s] Diagnosis: '%s' (Confidence: %.0f%%) | Symptoms reported: %s",
                        entry.getCreatedAt() != null ? entry.getCreatedAt().toLocalDate().toString() : "Unknown date",
                        entry.getFinalDiagnosis() != null ? entry.getFinalDiagnosis() : "Unknown",
                        entry.getConfidenceScore() != null ? entry.getConfidenceScore() : 0.0,
                        entry.getSymptomsInput() != null
                                ? entry.getSymptomsInput().substring(0, Math.min(entry.getSymptomsInput().length(), 120))
                                : "Not recorded"))
                .collect(Collectors.joining("\n"));
    }

    /**
     * Safe baseline vitals used as a fallback if the LLM fails to produce valid JSON.
     * Represents a healthy adult with no significant risk indicators.
     */
    private Map<String, Object> getBaselineVitals() {
        Map<String, Object> baseline = new HashMap<>();
        baseline.put("glucose",                    90);
        baseline.put("blood_pressure",             75);
        baseline.put("bmi",                        23.0);
        baseline.put("chest_pain_type",            1);
        baseline.put("cholesterol",                185);
        baseline.put("max_heart_rate",             150);
        baseline.put("exercise_induced_angina",    0);
        baseline.put("st_depression",              0.0);
        baseline.put("fasting_blood_sugar_gt120",  0);
        baseline.put("diabetes_pedigree_function", 0.3);
        return baseline;
    }
}
