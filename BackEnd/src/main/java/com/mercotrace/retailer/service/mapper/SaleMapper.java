package com.mercotrace.retailer.service.mapper;

import com.mercotrace.retailer.domain.Sale;
import com.mercotrace.retailer.domain.Store;
import com.mercotrace.retailer.service.dto.SaleDTO;
import com.mercotrace.retailer.service.dto.StoreDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Sale} and its DTO {@link SaleDTO}.
 */
@Mapper(componentModel = "spring")
public interface SaleMapper extends EntityMapper<SaleDTO, Sale> {
    @Mapping(target = "store", source = "store", qualifiedByName = "storeId")
    SaleDTO toDto(Sale s);

    @Named("storeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    StoreDTO toDtoStoreId(Store store);
}
