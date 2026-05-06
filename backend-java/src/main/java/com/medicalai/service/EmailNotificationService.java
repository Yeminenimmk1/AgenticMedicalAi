package com.medicalai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnBean(JavaMailSender.class)
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    /**
     * Sends a plain-text email asynchronously so it never blocks the API response thread.
     *
     * @param to      Recipient email address
     * @param subject Email subject line
     * @param body    Email body (plain text, bullet-point friendly)
     */
    @Async
    public void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            log.warn("Email send skipped — recipient address is empty.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("AgenticMed AI <your-gmail@gmail.com>");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MailException ex) {
            // Non-fatal — log and continue. The triage result is still returned to frontend.
            log.error("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }

    /**
     * Builds and sends a formatted AI Triage result email to the patient.
     */
    @Async
    public void sendTriageResultEmail(String to, String patientName, String diagnosis,
                                      double confidence, String reasoning, boolean emergency) {
        String subject = emergency
                ? "⚠️ EMERGENCY: Your AgenticMed AI Triage Result"
                : "✅ Your AgenticMed AI Triage Result is Ready";

        String body = String.format("""
                Hello %s,

                The AgenticMed AI Medical Board has completed its analysis of your submitted symptoms.
                Below is your personalised triage summary:

                ─────────────────────────────────────
                  DIAGNOSIS:   %s
                  CONFIDENCE:  %.1f%%
                  STATUS:      %s
                ─────────────────────────────────────

                DOCTOR BOARD REASONING:
                %s

                ─────────────────────────────────────
                %s

                This is an AI-generated preliminary analysis and is NOT a substitute for
                professional medical advice. Please consult a licensed physician.

                — AgenticMed AI Team
                """,
                patientName,
                diagnosis,
                confidence,
                emergency ? "🚨 EMERGENCY — Seek immediate medical attention" : "Stable",
                reasoning,
                emergency ? "⚠️  An emergency escalation alert has been auto-triggered. Please seek immediate care." : "Stay hydrated, rest, and monitor your symptoms."
        );

        sendEmail(to, subject, body);
    }

    /**
     * Notifies a patient that a doctor has replied to their consultation request.
     */
    @Async
    public void sendDoctorReplyNotification(String to, String patientName, String doctorName) {
        String subject = "💬 Dr. " + doctorName + " has responded to your consultation";

        String body = String.format("""
                Hello %s,

                Great news — a doctor has reviewed your AI Triage case and sent you a personal reply.

                  Doctor:  %s
                  Action:  Reviewed your AgenticMed AI diagnosis

                Please log in to your AgenticMed AI Patient Portal to read the full response
                and any clinical recommendations.

                ─────────────────────────────────────
                Login at:  http://localhost:5500/index.html
                ─────────────────────────────────────

                This notification was sent automatically. Do not reply to this email.

                — AgenticMed AI Team
                """,
                patientName,
                doctorName
        );

        sendEmail(to, subject, body);
    }
}
