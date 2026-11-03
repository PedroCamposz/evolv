package com.evolv.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Site publicado: o build do React (pasta dist) e copiado para
 * resources/static e servido pelo proprio Spring Boot.
 *
 * Como o React cuida das rotas no navegador (/login, /dashboard...), qualquer
 * caminho que nao seja um arquivo existente devolve o index.html. As rotas
 * /api continuam indo para os controllers normalmente.
 *
 * Em desenvolvimento (sem a pasta static) isto nao faz nada.
 */
@Configuration
public class SpaConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }
                        Resource arquivo = location.createRelative(resourcePath);
                        if (arquivo.exists() && arquivo.isReadable()) {
                            return arquivo;
                        }
                        Resource index = new ClassPathResource("/static/index.html");
                        return index.exists() ? index : null;
                    }
                });
    }
}
