package com.mercotrace.retailer.service.mapper;

import com.mercotrace.retailer.domain.InventoryLot;
import com.mercotrace.retailer.domain.Sku;
import com.mercotrace.retailer.domain.Store;
import com.mercotrace.retailer.service.dto.InventoryLotDTO;
import com.mercotrace.retailer.service.dto.SkuDTO;
import com.mercotrace.retailer.service.dto.StoreDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link InventoryLot} and its DTO {@link InventoryLotDTO}.
 */
@Mapper(componentModel = "spring")
public interface InventoryLotMapper extends EntityMapper<InventoryLotDTO, InventoryLot> {
    @Mapping(target = "sku", source = "sku", qualifiedByName = "skuId")
    @Mapping(target = "store", source = "store", qualifiedByName = "storeId")
    InventoryLotDTO toDto(InventoryLot s);

    @Named("skuId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    SkuDTO toDtoSkuId(Sku sku);

    @Named("storeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    StoreDTO toDtoStoreId(Store store);
}
