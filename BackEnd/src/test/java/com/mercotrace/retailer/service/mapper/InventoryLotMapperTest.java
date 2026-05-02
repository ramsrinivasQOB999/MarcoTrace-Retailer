package com.mercotrace.retailer.service.mapper;

import static com.mercotrace.retailer.domain.InventoryLotAsserts.*;
import static com.mercotrace.retailer.domain.InventoryLotTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class InventoryLotMapperTest {

    private InventoryLotMapper inventoryLotMapper;

    @BeforeEach
    void setUp() {
        inventoryLotMapper = new InventoryLotMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getInventoryLotSample1();
        var actual = inventoryLotMapper.toEntity(inventoryLotMapper.toDto(expected));
        assertInventoryLotAllPropertiesEquals(expected, actual);
    }
}
