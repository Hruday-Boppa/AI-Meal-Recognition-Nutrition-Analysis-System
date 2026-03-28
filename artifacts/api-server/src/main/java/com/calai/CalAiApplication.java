package com.calai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CalAiApplication {
    public static void main(String[] args) {
        SpringApplication.run(CalAiApplication.class, args);
    }
}
