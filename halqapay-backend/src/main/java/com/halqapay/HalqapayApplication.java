package com.halqapay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class HalqapayApplication {
    public static void main(String[] args) {
        SpringApplication.run(HalqapayApplication.class, args);
    }

    @RestController
    @RequestMapping("/api")
    static class HealthController {
        @GetMapping("/health")
        public String health() {
            return "OK";
        }
    }
}
