package com.mercotrace.retailer.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link com.mercotrace.retailer.domain.InventoryLot} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class InventoryLotDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer qty;

    @NotNull
    private Integer remaining;

    @NotNull
    private BigDecimal costPrice;

    @NotNull
    private BigDecimal sellPrice;

    @NotNull
    private Instant purchaseDate;

    @NotNull
    private Instant expiryDate;

    private String supplier;

    private String invoiceNo;

    @NotNull
    private SkuDTO sku;

    @NotNull
    private StoreDTO store;

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

    public Integer getRemaining() {
        return remaining;
    }

    public void setRemaining(Integer remaining) {
        this.remaining = remaining;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public BigDecimal getSellPrice() {
        return sellPrice;
    }

    public void setSellPrice(BigDecimal sellPrice) {
        this.sellPrice = sellPrice;
    }

    public Instant getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(Instant purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Instant getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(Instant expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public String getInvoiceNo() {
        return invoiceNo;
    }

    public void setInvoiceNo(String invoiceNo) {
        this.invoiceNo = invoiceNo;
    }

    public SkuDTO getSku() {
        return sku;
    }

    public void setSku(SkuDTO sku) {
        this.sku = sku;
    }

    public StoreDTO getStore() {
        return store;
    }

    public void setStore(StoreDTO store) {
        this.store = store;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof InventoryLotDTO)) {
            return false;
        }

        InventoryLotDTO inventoryLotDTO = (InventoryLotDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, inventoryLotDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "InventoryLotDTO{" +
            "id=" + getId() +
            ", qty=" + getQty() +
            ", remaining=" + getRemaining() +
            ", costPrice=" + getCostPrice() +
            ", sellPrice=" + getSellPrice() +
            ", purchaseDate='" + getPurchaseDate() + "'" +
            ", expiryDate='" + getExpiryDate() + "'" +
            ", supplier='" + getSupplier() + "'" +
            ", invoiceNo='" + getInvoiceNo() + "'" +
            ", sku=" + getSku() +
            ", store=" + getStore() +
            "}";
    }
}
