package com.nihongo.practice_nihongo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Nihongo Practice API")
                        .version("1.0")
                        .description("Hệ thống API quản lý học tập tiếng Nhật - Ngữ pháp & Giáo trình")
                        .contact(new Contact()
                                .name("Antigravity AI")
                                .email("support@nihongo.com")));
    }
}
