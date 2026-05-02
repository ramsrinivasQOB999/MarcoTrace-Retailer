package com.mercotrace.retailer.service.mapper;

import com.mercotrace.retailer.domain.Sku;
import com.mercotrace.retailer.service.dto.SkuDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Sku} and its DTO {@link SkuDTO}.
 */
@Mapper(componentModel = "spring")
public interface SkuMapper extends EntityMapper<SkuDTO, Sku> {}
