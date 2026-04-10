package com.sharespace.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
public class EnvConfig {

    @PostConstruct
    public void loadEnv() {
        // When running via `mvn spring-boot:run` from the backend/ folder,
        // the .env lives in the project root (one level up). Try current dir first.
        String dotenvDir = ".";
        if (!Files.exists(Paths.get(".env")) && Files.exists(Paths.get("../.env"))) {
            dotenvDir = "..";
        }

        Dotenv dotenv = Dotenv.configure()
                .directory(dotenvDir)
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
    }
}
