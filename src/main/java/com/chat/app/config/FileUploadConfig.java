package com.chat.app.config;

import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry) {

        String imageUploadPath =
                Paths.get("uploads/images")
                        .toAbsolutePath()
                        .normalize()
                        .toUri()
                        .toString();

        String fileUploadPath =
                Paths.get("uploads/files")
                        .toAbsolutePath()
                        .normalize()
                        .toUri()
                        .toString();


        registry
                .addResourceHandler(
                        "/uploads/images/**"
                )
                .addResourceLocations(
                        imageUploadPath
                );


        registry
                .addResourceHandler(
                        "/uploads/files/**"
                )
                .addResourceLocations(
                        fileUploadPath
                );
    }
}