package com.sharespace.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOriginPatterns(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173",
                        "http://192.168.*:5173",
                        "http://10.*:5173",
                        "http://172.16.*:5173",
                        "http://172.17.*:5173",
                        "http://172.18.*:5173",
                        "http://172.19.*:5173",
                        "http://172.20.*:5173",
                        "http://172.21.*:5173",
                        "http://172.22.*:5173",
                        "http://172.23.*:5173",
                        "http://172.24.*:5173",
                        "http://172.25.*:5173",
                        "http://172.26.*:5173",
                        "http://172.27.*:5173",
                        "http://172.28.*:5173",
                        "http://172.29.*:5173",
                        "http://172.30.*:5173",
                        "http://172.31.*:5173"
                    )
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
