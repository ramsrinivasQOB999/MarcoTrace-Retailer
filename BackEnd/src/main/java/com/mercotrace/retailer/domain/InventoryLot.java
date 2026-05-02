package com.mercotrace.retailer.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A InventoryLot.
 */
@Entity
@Table(name = "inventory_lot")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class InventoryLot implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "qty", nullable = false)
    private Integer qty;

    @NotNull
    @Column(name = "remaining", nullable = false)
    private Integer remaining;

    @NotNull
    @Column(name = "cost_price", precision = 21, scale = 2, nullable = false)
    private BigDecimal costPrice;

    @NotNull
    @Column(name = "sell_price", precision = 21, scale = 2, nullable = false)
    private BigDecimal sellPrice;

    @NotNull
    @Column(name = "purchase_date", nullable = false)
    private Instant purchaseDate;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    @Column(name = "supplier")
    private String supplier;

    @Column(name = "invoice_no")
    private String invoiceNo;

    @ManyToOne(optional = false)
    @NotNull
    private Sku sku;

    @ManyToOne(optional = false)
    @NotNull
    private Store store;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public InventoryLot id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getQty() {
        return this.qty;
    }

    public InventoryLot qty(Integer qty) {
        this.setQty(qty);
        return this;
    }

    public void setQty(Integer qty) {
        this.qty = qty;
    }

    public Integer getRemaining() {
        return this.remaining;
    }

    public InventoryLot remaining(Integer remaining) {
        this.setRemaining(remaining);
        return this;
    }

    public void setRemaining(Integer remaining) {
        this.remaining = remaining;
    }

    public BigDecimal getCostPrice() {
        return this.costPrice;
    }

    public InventoryLot costPrice(BigDecimal costPrice) {
        this.setCostPrice(costPrice);
        return this;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public BigDecimal getSellPrice() {
        return this.sellPrice;
    }

    public InventoryLot sellPrice(BigDecimal sellPrice) {
        this.setSellPrice(sellPrice);
        return this;
    }

    public void setSellPrice(BigDecimal sellPrice) {
        this.sellPrice = sellPrice;
    }

    public Instant getPurchaseDate() {
        return this.purchaseDate;
    }

    public InventoryLot purchaseDate(Instant purchaseDate) {
        this.setPurchaseDate(purchaseDate);
        return this;
    }

    public void setPurchaseDate(Instant purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public Instant getExpiryDate() {
        return this.expiryDate;
    }

    public InventoryLot expiryDate(Instant expiryDate) {
        this.setExpiryDate(expiryDate);
        return this;
    }

    public void setExpiryDate(Instant expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getSupplier() {
        return this.supplier;
    }

    public InventoryLot supplier(String supplier) {
        this.setSupplier(supplier);
        return this;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public String getInvoiceNo() {
        return this.invoiceNo;
    }

    public InventoryLot invoiceNo(String invoiceNo) {
        this.setInvoiceNo(invoiceNo);
        return this;
    }

    public void setInvoiceNo(String invoiceNo) {
        this.invoiceNo = invoiceNo;
    }

    public Sku getSku() {
        return this.sku;
    }

    public void setSku(Sku sku) {
        this.sku = sku;
    }

    public InventoryLot sku(Sku sku) {
        this.setSku(sku);
        return this;
    }

    public Store getStore() {
        return this.store;
    }

    public void setStore(Store store) {
        this.store = store;
    }

    public InventoryLot store(Store store) {
        this.setStore(store);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof InventoryLot)) {
            return false;
        }
        return getId() != null && getId().equals(((InventoryLot) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "InventoryLot{" +
            "id=" + getId() +
            ", qty=" + getQty() +
            ", remaining=" + getRemaining() +
            ", costPrice=" + getCostPrice() +
            ", sellPrice=" + getSellPrice() +
            ", purchaseDate='" + getPurchaseDate() + "'" +
            ", expiryDate='" + getExpiryDate() + "'" +
            ", supplier='" + getSupplier() + "'" +
            ", invoiceNo='" + getInvoiceNo() + "'" +
            "}";
    }
}
