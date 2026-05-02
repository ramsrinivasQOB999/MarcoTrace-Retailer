package com.mercotrace.retailer.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.mercotrace.retailer.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class SaleLineDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(SaleLineDTO.class);
        SaleLineDTO saleLineDTO1 = new SaleLineDTO();
        saleLineDTO1.setId(1L);
        SaleLineDTO saleLineDTO2 = new SaleLineDTO();
        assertThat(saleLineDTO1).isNotEqualTo(saleLineDTO2);
        saleLineDTO2.setId(saleLineDTO1.getId());
        assertThat(saleLineDTO1).isEqualTo(saleLineDTO2);
        saleLineDTO2.setId(2L);
        assertThat(saleLineDTO1).isNotEqualTo(saleLineDTO2);
        saleLineDTO1.setId(null);
        assertThat(saleLineDTO1).isNotEqualTo(saleLineDTO2);
    }
}
