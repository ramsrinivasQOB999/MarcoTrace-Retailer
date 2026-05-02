package com.mercotrace.retailer.domain;

import static com.mercotrace.retailer.domain.InventoryLotTestSamples.*;
import static com.mercotrace.retailer.domain.SkuTestSamples.*;
import static com.mercotrace.retailer.domain.StoreTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.mercotrace.retailer.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class InventoryLotTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(InventoryLot.class);
        InventoryLot inventoryLot1 = getInventoryLotSample1();
        InventoryLot inventoryLot2 = new InventoryLot();
        assertThat(inventoryLot1).isNotEqualTo(inventoryLot2);

        inventoryLot2.setId(inventoryLot1.getId());
        assertThat(inventoryLot1).isEqualTo(inventoryLot2);

        inventoryLot2 = getInventoryLotSample2();
        assertThat(inventoryLot1).isNotEqualTo(inventoryLot2);
    }

    @Test
    void skuTest() {
        InventoryLot inventoryLot = getInventoryLotRandomSampleGenerator();
        Sku skuBack = getSkuRandomSampleGenerator();

        inventoryLot.setSku(skuBack);
        assertThat(inventoryLot.getSku()).isEqualTo(skuBack);

        inventoryLot.sku(null);
        assertThat(inventoryLot.getSku()).isNull();
    }

    @Test
    void storeTest() {
        InventoryLot inventoryLot = getInventoryLotRandomSampleGenerator();
        Store storeBack = getStoreRandomSampleGenerator();

        inventoryLot.setStore(storeBack);
        assertThat(inventoryLot.getStore()).isEqualTo(storeBack);

        inventoryLot.store(null);
        assertThat(inventoryLot.getStore()).isNull();
    }
}
