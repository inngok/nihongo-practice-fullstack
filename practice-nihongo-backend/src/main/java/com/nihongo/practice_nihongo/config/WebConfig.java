package com.nihongo.practice_nihongo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final DataChangeInterceptor dataChangeInterceptor;

    public WebConfig(DataChangeInterceptor dataChangeInterceptor) {
        this.dataChangeInterceptor = dataChangeInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(dataChangeInterceptor).addPathPatterns("/api/**");
    }
}
