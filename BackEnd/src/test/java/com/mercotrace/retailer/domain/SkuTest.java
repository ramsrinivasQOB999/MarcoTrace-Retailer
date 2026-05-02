package com.mercotrace.retailer.domain;

import static com.mercotrace.retailer.domain.SkuTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.mercotrace.retailer.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class SkuTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Sku.class);
        Sku sku1 = getSkuSample1();
        Sku sku2 = new Sku();
        assertThat(sku1).isNotEqualTo(sku2);

        sku2.setId(sku1.getId());
        assertThat(sku1).isEqualTo(sku2);

        sku2 = getSkuSample2();
        assertThat(sku1).isNotEqualTo(sku2);
    }
}
