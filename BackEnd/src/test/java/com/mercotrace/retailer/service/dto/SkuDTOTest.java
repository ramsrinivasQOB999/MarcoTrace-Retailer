package com.mercotrace.retailer.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.mercotrace.retailer.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class SkuDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(SkuDTO.class);
        SkuDTO skuDTO1 = new SkuDTO();
        skuDTO1.setId(1L);
        SkuDTO skuDTO2 = new SkuDTO();
        assertThat(skuDTO1).isNotEqualTo(skuDTO2);
        skuDTO2.setId(skuDTO1.getId());
        assertThat(skuDTO1).isEqualTo(skuDTO2);
        skuDTO2.setId(2L);
        assertThat(skuDTO1).isNotEqualTo(skuDTO2);
        skuDTO1.setId(null);
        assertThat(skuDTO1).isNotEqualTo(skuDTO2);
    }
}
