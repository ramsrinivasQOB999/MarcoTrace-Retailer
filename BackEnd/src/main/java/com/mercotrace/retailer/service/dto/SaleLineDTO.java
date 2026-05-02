package com.mercotrace.retailer.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link com.mercotrace.retailer.domain.SaleLine} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SaleLineDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer qty;

    @NotNull
    private BigDecimal price;

    @NotNull
    private SaleDTO sale;

    @NotNull
    private SkuDTO sku;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQty() {
        return qty;
    }

    public void setQty(Integer qty) {
        this.qty = qty;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public SaleDTO getSale() {
        return sale;
    }

    public void setSale(SaleDTO sale) {
        this.sale = sale;
    }

    public SkuDTO getSku() {
        return sku;
    }

    public void setSku(SkuDTO sku) {
        this.sku = sku;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SaleLineDTO)) {
            return false;
        }

        SaleLineDTO saleLineDTO = (SaleLineDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, saleLineDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SaleLineDTO{" +
            "id=" + getId() +
            ", qty=" + getQty() +
            ", price=" + getPrice() +
            ", sale=" + getSale() +
            ", sku=" + getSku() +
            "}";
    }
}
