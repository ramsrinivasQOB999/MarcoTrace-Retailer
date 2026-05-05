package com.mercotrace.retailer.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import java.util.Set;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3 / Swagger UI metadata and JWT security scheme for team-facing API documentation.
 */
@Configuration
public class OpenApiConfiguration {

    private static final Set<String> PUBLIC_API_PATHS = Set.of(
        "/api/authenticate",
        "/api/register",
        "/api/activate",
        "/api/account/reset-password/init",
        "/api/account/reset-password/finish"
    );

    @Bean
    public OpenApiCustomizer mercotraceOpenApiCustomizer() {
        return openApi -> {
            openApi.info(
                new Info()
                    .title("Mercotrace Retailer API")
                    .version("0.0.1")
                    .description(
                        """
                        REST API for **Mercotrace Retailer**: stores, SKUs, inventory lots, sales, sale lines, and JHipster identity administration.

                        ### How to authenticate (Swagger UI)
                        1. Open **Authentication** → **POST** `/api/authenticate`.
                        2. Use body `{"username":"admin","password":"admin"}` (or another seeded user). **Execute**.
                        3. Copy **`id_token`** from the response **or** the `Authorization` response header (value after `Bearer `).
                        4. Click **Authorize** at the top, choose **bearer-jwt**, paste the **token only** (no `Bearer ` prefix).
                        5. Call other `/api/**` operations; **User administration** requires `ROLE_ADMIN`.

                        ### Machine clients
                        - `POST /api/authenticate` → JSON response field **`id_token`**.
                        - Send `Authorization: Bearer <id_token>` on subsequent requests.

                        ### Pagination
                        Where supported, use Spring Data query params: `page`, `size`, `sort` (e.g. `sort=id,desc`).
                        """
                    )
                    .contact(new Contact().name("Mercotrace engineering").email("engineering@mercotrace.local"))
                    .license(new License().name("Internal use only"))
            );

            openApi.setServers(
                List.of(
                    new Server().url("/").description("Current deployed host"),
                    new Server().url("http://localhost:8090").description("Local Spring Boot (application-dev default port)")
                )
            );

            Components components = openApi.getComponents() != null ? openApi.getComponents() : new Components();
            components.addSecuritySchemes(
                "bearer-jwt",
                new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT from `POST /api/authenticate` — use the `id_token` value. Validity is configured under `jhipster.security.authentication.jwt`.")
            );
            openApi.setComponents(components);

            if (openApi.getPaths() == null) {
                return;
            }
            openApi
                .getPaths()
                .forEach((path, pathItem) ->
                    pathItem.readOperationsMap().values().forEach(operation -> {
                        if (PUBLIC_API_PATHS.contains(path)) {
                            operation.setSecurity(List.of());
                        } else if (path.startsWith("/api/")) {
                            operation.setSecurity(List.of(new SecurityRequirement().addList("bearer-jwt")));
                        }
                    })
                );
        };
    }
}
