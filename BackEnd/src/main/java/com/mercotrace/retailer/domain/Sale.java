package com.mercotrace.retailer.domain;

import com.mercotrace.retailer.domain.enumeration.PaymentMethod;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Sale.
 */
@Entity
@Table(name = "sale")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Sale implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "bill_no", nullable = false, unique = true)
    private String billNo;

    @NotNull
    @Column(name = "date", nullable = false)
    private Instant date;

    @NotNull
    @Column(name = "total", precision = 21, scale = 2, nullable = false)
    private BigDecimal total;

    @NotNull
    @Column(name = "gst", precision = 21, scale = 2, nullable = false)
    private BigDecimal gst;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "payment", nullable = false)
    private PaymentMethod payment;

    @ManyToOne(optional = false)
    @NotNull
    private Store store;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Sale id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBillNo() {
        return this.billNo;
    }

    public Sale billNo(String billNo) {
        this.setBillNo(billNo);
        return this;
    }

    public void setBillNo(String billNo) {
        this.billNo = billNo;
    }

    public Instant getDate() {
        return this.date;
    }

    public Sale date(Instant date) {
        this.setDate(date);
        return this;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public BigDecimal getTotal() {
        return this.total;
    }

    public Sale total(BigDecimal total) {
        this.setTotal(total);
        return this;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getGst() {
        return this.gst;
    }

    public Sale gst(BigDecimal gst) {
        this.setGst(gst);
        return this;
    }

    public void setGst(BigDecimal gst) {
        this.gst = gst;
    }

    public PaymentMethod getPayment() {
        return this.payment;
    }

    public Sale payment(PaymentMethod payment) {
        this.setPayment(payment);
        return this;
    }

    public void setPayment(PaymentMethod payment) {
        this.payment = payment;
    }

    public Store getStore() {
        return this.store;
    }

    public void setStore(Store store) {
        this.store = store;
    }

    public Sale store(Store store) {
        this.setStore(store);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Sale)) {
            return false;
        }
        return getId() != null && getId().equals(((Sale) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Sale{" +
            "id=" + getId() +
            ", billNo='" + getBillNo() + "'" +
            ", date='" + getDate() + "'" +
            ", total=" + getTotal() +
            ", gst=" + getGst() +
            ", payment='" + getPayment() + "'" +
            "}";
    }
}
