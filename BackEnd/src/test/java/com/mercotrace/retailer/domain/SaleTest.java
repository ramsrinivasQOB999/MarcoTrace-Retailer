package com.mercotrace.retailer.domain;

import static com.mercotrace.retailer.domain.SaleTestSamples.*;
import static com.mercotrace.retailer.domain.StoreTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.mercotrace.retailer.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class SaleTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Sale.class);
        Sale sale1 = getSaleSample1();
        Sale sale2 = new Sale();
        assertThat(sale1).isNotEqualTo(sale2);

        sale2.setId(sale1.getId());
        assertThat(sale1).isEqualTo(sale2);

        sale2 = getSaleSample2();
        assertThat(sale1).isNotEqualTo(sale2);
    }

    @Test
    void storeTest() {
        Sale sale = getSaleRandomSampleGenerator();
        Store storeBack = getStoreRandomSampleGenerator();

        sale.setStore(storeBack);
        assertThat(sale.getStore()).isEqualTo(storeBack);

        sale.store(null);
        assertThat(sale.getStore()).isNull();
    }
}
