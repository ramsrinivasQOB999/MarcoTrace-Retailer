package com.mercotrace.retailer.service.mapper;

import com.mercotrace.retailer.domain.Sale;
import com.mercotrace.retailer.domain.SaleLine;
import com.mercotrace.retailer.domain.Sku;
import com.mercotrace.retailer.service.dto.SaleDTO;
import com.mercotrace.retailer.service.dto.SaleLineDTO;
import com.mercotrace.retailer.service.dto.SkuDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link SaleLine} and its DTO {@link SaleLineDTO}.
 */
@Mapper(componentModel = "spring")
public interface SaleLineMapper extends EntityMapper<SaleLineDTO, SaleLine> {
    @Mapping(target = "sale", source = "sale", qualifiedByName = "saleId")
    @Mapping(target = "sku", source = "sku", qualifiedByName = "skuId")
    SaleLineDTO toDto(SaleLine s);

    @Named("saleId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    SaleDTO toDtoSaleId(Sale sale);

    @Named("skuId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    SkuDTO toDtoSkuId(Sku sku);
}
