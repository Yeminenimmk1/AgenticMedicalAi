package com.medicalai.service;

import com.medicalai.entity.Patient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Emergency rule engine for the Agentic Medical Ecosystem.
 * Simulates triggering of Twilio SMS API to escalate a patient
 * directly to a hospital/ambulance when the Supervisor AI tags an emergency.
 */
@Slf4j
@Service
public class EmergencyRulesService {

    /**
     * Triggers the Emergency Protocol.
     * In a live environment, this would call the Twilio SDK to send an SMS/WhatsApp.
     * 
     * @param patient patient entity
     * @param diagnosis the final diagnosis agreed by the medical board
     * @return boolean indicating if the alert was successfully sent
     */
    public boolean triggerEmergencyProtocol(Patient patient, String diagnosis) {
        log.warn("🚨 EMERGENCY PROTOCOL TRIGGERED! Patient: {}, Age: {}", patient.getFullName(), patient.getAge());
        
        try {
            // Find nearest hospital based on villageZip (mock logic)
            String nearestHospital = "St. John's Medical Center (Zip: " + patient.getVillageZip() + ")";
            String ambulanceNumber = "+1-555-AMBULANCE";
            
            String smsMessage = String.format(
                "[URGENT DISPATCH] Patient %s, %s y/o, is experiencing a %s. ML Risk factors flagged. Please dispatch to %s immediately.",
                patient.getFullName(), patient.getAge(), diagnosis, patient.getPhoneNumber()
            );

            log.info("Sending SMS via Twilio API to: {}", ambulanceNumber);
            log.info("SMS Body: {}", smsMessage);

            // Simulate network latency for API call
            Thread.sleep(1000);

            log.info("✅ Auto-Escalation SMS Sent Successfully.");
            
            return true;
        } catch (InterruptedException e) {
            log.error("Failed to send Emergency SMS alert to Twilio.", e);
            Thread.currentThread().interrupt();
            return false;
        }
    }
}
