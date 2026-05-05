package com.mercotrace.retailer.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.io.Serial;
import java.io.Serializable;

/**
 * A DTO representing a password change required data - current and new password.
 */
@Schema(name = "PasswordChangeRequest", description = "Payload for POST /api/account/change-password.")
public class PasswordChangeDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Schema(example = "admin", requiredMode = Schema.RequiredMode.REQUIRED)
    private String currentPassword;
    @Schema(example = "N3wSecurePass!234", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;

    public PasswordChangeDTO() {
        // Empty constructor needed for Jackson.
    }

    public PasswordChangeDTO(String currentPassword, String newPassword) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
