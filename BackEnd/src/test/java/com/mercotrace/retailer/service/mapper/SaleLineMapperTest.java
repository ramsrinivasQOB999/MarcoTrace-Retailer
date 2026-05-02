package com.mercotrace.retailer.service.mapper;

import static com.mercotrace.retailer.domain.SaleLineAsserts.*;
import static com.mercotrace.retailer.domain.SaleLineTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SaleLineMapperTest {

    private SaleLineMapper saleLineMapper;

    @BeforeEach
    void setUp() {
        saleLineMapper = new SaleLineMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getSaleLineSample1();
        var actual = saleLineMapper.toEntity(saleLineMapper.toDto(expected));
        assertSaleLineAllPropertiesEquals(expected, actual);
    }
}
