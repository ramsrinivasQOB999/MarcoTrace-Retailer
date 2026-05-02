package com.mercotrace.retailer.domain;

import static com.mercotrace.retailer.domain.SaleLineTestSamples.*;
import static com.mercotrace.retailer.domain.SaleTestSamples.*;
import static com.mercotrace.retailer.domain.SkuTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.mercotrace.retailer.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class SaleLineTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(SaleLine.class);
        SaleLine saleLine1 = getSaleLineSample1();
        SaleLine saleLine2 = new SaleLine();
        assertThat(saleLine1).isNotEqualTo(saleLine2);

        saleLine2.setId(saleLine1.getId());
        assertThat(saleLine1).isEqualTo(saleLine2);

        saleLine2 = getSaleLineSample2();
        assertThat(saleLine1).isNotEqualTo(saleLine2);
    }

    @Test
    void saleTest() {
        SaleLine saleLine = getSaleLineRandomSampleGenerator();
        Sale saleBack = getSaleRandomSampleGenerator();

        saleLine.setSale(saleBack);
        assertThat(saleLine.getSale()).isEqualTo(saleBack);

        saleLine.sale(null);
        assertThat(saleLine.getSale()).isNull();
    }

    @Test
    void skuTest() {
        SaleLine saleLine = getSaleLineRandomSampleGenerator();
        Sku skuBack = getSkuRandomSampleGenerator();

        saleLine.setSku(skuBack);
        assertThat(saleLine.getSku()).isEqualTo(skuBack);

        saleLine.sku(null);
        assertThat(saleLine.getSku()).isNull();
    }
}
