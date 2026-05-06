package com.medicalai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

/**
 * Health Check Controller — used by UptimeRobot to keep the Render free-tier alive.
 * Supports both GET and HEAD requests.
 */
@RestController
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "medicalai-backend",
                "timestamp", Instant.now().toString()
        ));
    }

    @RequestMapping(value = "/api/health", method = RequestMethod.HEAD)
    public ResponseEntity<Void> healthHead() {
        return ResponseEntity.ok().build();
    }
}
