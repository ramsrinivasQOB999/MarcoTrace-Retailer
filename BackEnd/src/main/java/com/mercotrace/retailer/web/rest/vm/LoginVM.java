package com.mercotrace.retailer.web.rest.vm;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * View Model object for storing a user's credentials.
 */
@Schema(name = "LoginRequest", description = "Credentials payload used by POST /api/authenticate.")
public class LoginVM {

    @NotNull
    @Size(min = 1, max = 254)
    @Schema(example = "admin", requiredMode = Schema.RequiredMode.REQUIRED)
    private String username;

    @NotNull
    @Size(min = 4, max = 100)
    @Schema(example = "admin", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @Schema(example = "true", description = "When true, server issues a longer-lived JWT.")
    private boolean rememberMe;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public boolean isRememberMe() {
        return rememberMe;
    }

    public void setRememberMe(boolean rememberMe) {
        this.rememberMe = rememberMe;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LoginVM{" +
            "username='" + username + '\'' +
            ", rememberMe=" + rememberMe +
            '}';
    }
}
