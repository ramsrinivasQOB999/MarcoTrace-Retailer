package com.mercotrace.retailer.service.mapper;

import static com.mercotrace.retailer.domain.SkuAsserts.*;
import static com.mercotrace.retailer.domain.SkuTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SkuMapperTest {

    private SkuMapper skuMapper;

    @BeforeEach
    void setUp() {
        skuMapper = new SkuMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getSkuSample1();
        var actual = skuMapper.toEntity(skuMapper.toDto(expected));
        assertSkuAllPropertiesEquals(expected, actual);
    }
}
