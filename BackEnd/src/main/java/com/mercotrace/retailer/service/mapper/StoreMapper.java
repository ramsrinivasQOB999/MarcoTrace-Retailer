package com.mercotrace.retailer.service.mapper;

import com.mercotrace.retailer.domain.Store;
import com.mercotrace.retailer.service.dto.StoreDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Store} and its DTO {@link StoreDTO}.
 */
@Mapper(componentModel = "spring")
public interface StoreMapper extends EntityMapper<StoreDTO, Store> {}
