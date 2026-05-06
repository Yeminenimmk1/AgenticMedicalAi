package com.medicalai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.reactive.function.client.WebClient;

@EnableAsync
@SpringBootApplication
public class MedicalAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedicalAiApplication.class, args);
    }

    // Configure WebClient to easily talk to the Python ML server
    @Bean
    public WebClient webClient(WebClient.Builder builder) {
        return builder.build();
    }
}
