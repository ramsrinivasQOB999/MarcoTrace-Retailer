package com.mercotrace.retailer.web.rest.vm;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * View Model object for storing the user's key and password.
 */
@Schema(name = "PasswordResetFinishRequest", description = "Payload for POST /api/account/reset-password/finish.")
public class KeyAndPasswordVM {

    @Schema(example = "e8b2f21f1e4f4fb1b0c0f9e6a40f6e68", requiredMode = Schema.RequiredMode.REQUIRED)
    private String key;

    @Schema(example = "N3wSecurePass!234", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
