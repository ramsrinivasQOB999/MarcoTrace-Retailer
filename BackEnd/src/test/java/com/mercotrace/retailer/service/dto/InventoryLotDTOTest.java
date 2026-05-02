package com.mercotrace.retailer.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.mercotrace.retailer.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class InventoryLotDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(InventoryLotDTO.class);
        InventoryLotDTO inventoryLotDTO1 = new InventoryLotDTO();
        inventoryLotDTO1.setId(1L);
        InventoryLotDTO inventoryLotDTO2 = new InventoryLotDTO();
        assertThat(inventoryLotDTO1).isNotEqualTo(inventoryLotDTO2);
        inventoryLotDTO2.setId(inventoryLotDTO1.getId());
        assertThat(inventoryLotDTO1).isEqualTo(inventoryLotDTO2);
        inventoryLotDTO2.setId(2L);
        assertThat(inventoryLotDTO1).isNotEqualTo(inventoryLotDTO2);
        inventoryLotDTO1.setId(null);
        assertThat(inventoryLotDTO1).isNotEqualTo(inventoryLotDTO2);
    }
}
