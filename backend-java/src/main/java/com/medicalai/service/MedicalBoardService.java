package com.medicalai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * The core Agentic AI service.
 * Represents a Multi-Doctor AI Board that debates a patient's symptoms
 * before reaching a consensus diagnosis.
 */
@Slf4j
@Service
public class MedicalBoardService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    // Strict Personas for each Agent
    private static final String FEVER_AGENT_PROMPT = """
        You are the Infectious Disease Expert (Fever Agent). 
        Analyze the patient's symptoms ONLY focusing on fever, chills, body aches, and vector-borne diseases (Dengue, Malaria, Typhoid).
        CRITICAL INSTRUCTION: You MUST cross-reference the new symptoms with their historical data and ML Risk Baselines before concluding.
        Be concise. What is your diagnosis and confidence score?
        Symptom input & Context: %s
        """;

    private static final String INFECTION_AGENT_PROMPT = """
        You are the Microbiologist (Infection Agent). 
        Analyze the patient's symptoms ONLY focusing on bacterial, viral, or fungal infection markers (cough, sputum, systemic inflammation).
        CRITICAL INSTRUCTION: You MUST cross-reference the new symptoms with their historical data and ML Risk Baselines before concluding.
        Be concise. What is your diagnosis and confidence score?
        Symptom input & Context: %s
        """;

    private static final String HEART_AGENT_PROMPT = """
        You are the Cardiologist (Heart Agent). 
        Analyze the patient's symptoms ONLY focusing on chest pain, blood pressure, radiating pain, diaphoresis, and cardiovascular indicators.
        CRITICAL INSTRUCTION: You MUST cross-reference the new symptoms with their historical data and ML Risk Baselines before concluding (e.g., Heart Disease risk).
        Be concise. What is your diagnosis and confidence score?
        Symptom input & Context: %s
        """;

    private static final String SUPERVISOR_AGENT_PROMPT = """
        You are the Chief Medical Officer (Supervisor Agent). 
        The patient originally presented with these symptoms and historical context: %s
        
        Below are the opinions from your three specialist doctors:
        
        [Fever Expert]: %s
        [Infection Expert]: %s
        [Cardiologist]: %s
        
        Analyze their debate. If there is a conflict, weigh the symptoms and decide correctly.
        CRITICAL INSTRUCTION: Provide a highly detailed, 3-sentence explanation of exactly why this diagnosis was chosen, explicitly referencing their past health data.
        
        Return ONLY a JSON response in this EXACT format, nothing else:
        {
          "final_diagnosis": "Disease Name",
          "confidence_score": 95.0,
          "emergency_flag": true_or_false,
          "reasoning": "Brief summary of why you chose this diagnosis"
        }
        """;

    public MedicalBoardService(ChatClient.Builder chatClientBuilder, ObjectMapper objectMapper) {
        this.chatClient = chatClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Triage patient symptoms using the Multi-Agent framework.
     */
    public Map<String, Object> conductMedicalBoardReview(String patientSymptoms) {
        log.info("Initiating Medical Board Review for symptoms: {}", patientSymptoms);

        // Step 1: Query the 3 specialists (In a truly async pipeline, these would run in parallel via CompletableFuture)
        String feverOpinion = askAgent(String.format(FEVER_AGENT_PROMPT, patientSymptoms));
        log.info("Fever Agent concluded.");
        
        String infectionOpinion = askAgent(String.format(INFECTION_AGENT_PROMPT, patientSymptoms));
        log.info("Infection Agent concluded.");
        
        String heartOpinion = askAgent(String.format(HEART_AGENT_PROMPT, patientSymptoms));
        log.info("Heart Agent concluded.");

        // Step 2: Pass opinions to the Supervisor
        String supervisorInput = String.format(SUPERVISOR_AGENT_PROMPT, patientSymptoms, feverOpinion, infectionOpinion, heartOpinion);
        String supervisorVerdictStr = askAgent(supervisorInput);

        // Step 3: Parse the JSON response
        try {
            // Strip markdown JSON blocks if the LLM added them
            if (supervisorVerdictStr.contains("```json")) {
                supervisorVerdictStr = supervisorVerdictStr.replaceAll("```json", "")
                                                           .replaceAll("```", "")
                                                           .trim();
            }
            
            JsonNode verdictJson = objectMapper.readTree(supervisorVerdictStr);

            return Map.of(
                "fever_agent_output", feverOpinion,
                "infection_agent_output", infectionOpinion,
                "heart_agent_output", heartOpinion,
                "final_diagnosis", verdictJson.path("final_diagnosis").asText("Unknown"),
                "confidence_score", verdictJson.path("confidence_score").asDouble(0.0),
                "emergency_flag", verdictJson.path("emergency_flag").asBoolean(false),
                "reasoning", verdictJson.path("reasoning").asText("No reasoning provided.")
            );

        } catch (JsonProcessingException e) {
            log.error("Failed to parse Supervisor JSON output: {}", supervisorVerdictStr, e);
            
            // Fallback response if LLM failed to output valid JSON
            return Map.of(
                "fever_agent_output", feverOpinion,
                "infection_agent_output", infectionOpinion,
                "heart_agent_output", heartOpinion,
                "final_diagnosis", "Manual Review Required - LLM Parse Error",
                "confidence_score", 0.0,
                "emergency_flag", true, // Assume emergency if logic fails
                "reasoning", "The AI Medical Board failed to reach a confident consensus."
            );
        }
    }

    private String askAgent(String prompt) {
        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }
}
