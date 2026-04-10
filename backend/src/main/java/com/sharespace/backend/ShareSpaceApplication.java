package com.sharespace.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Paths;

@SpringBootApplication
public class ShareSpaceApplication {

    public static void main(String[] args) {
        // Load .env before Spring context starts so datasource properties are available.
        // Try current dir (backend/) first, then fall back to project root (../)
        String dotenvDir = ".";
        if (!Files.exists(Paths.get(".env")) && Files.exists(Paths.get("../.env"))) {
            dotenvDir = "..";
        }
        Dotenv dotenv = Dotenv.configure()
                .directory(dotenvDir)
                .ignoreIfMissing()
                .load();
        dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));

        SpringApplication.run(ShareSpaceApplication.class, args);
    }
}
