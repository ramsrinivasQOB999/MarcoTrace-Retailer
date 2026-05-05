package com.mercotrace.retailer.service.dto;

import com.mercotrace.retailer.domain.enumeration.StoreStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link com.mercotrace.retailer.domain.Store} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
@Schema(name = "Store", description = "Store payload used by /api/stores endpoints.")
public class StoreDTO implements Serializable {

    @Schema(example = "42", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotNull
    @Schema(example = "STR-CHN-001", requiredMode = Schema.RequiredMode.REQUIRED)
    private String code;

    @NotNull
    @Schema(example = "Mercotrace Anna Nagar", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(example = "Chennai")
    private String city;

    @Schema(example = "North Chennai")
    private String agglomeration;

    @NotNull
    @Schema(example = "ACTIVE", requiredMode = Schema.RequiredMode.REQUIRED)
    private StoreStatus status;

    @Schema(example = "R. Karthik")
    private String owner;

    @Schema(example = "+91-9000000000")
    private String phone;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAgglomeration() {
        return agglomeration;
    }

    public void setAgglomeration(String agglomeration) {
        this.agglomeration = agglomeration;
    }

    public StoreStatus getStatus() {
        return status;
    }

    public void setStatus(StoreStatus status) {
        this.status = status;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof StoreDTO)) {
            return false;
        }

        StoreDTO storeDTO = (StoreDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, storeDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "StoreDTO{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", name='" + getName() + "'" +
            ", city='" + getCity() + "'" +
            ", agglomeration='" + getAgglomeration() + "'" +
            ", status='" + getStatus() + "'" +
            ", owner='" + getOwner() + "'" +
            ", phone='" + getPhone() + "'" +
            "}";
    }
}
