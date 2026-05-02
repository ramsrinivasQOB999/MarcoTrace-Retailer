package com.mercotrace.retailer.repository;

import com.mercotrace.retailer.domain.Sku;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Sku entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SkuRepository extends JpaRepository<Sku, Long> {}
