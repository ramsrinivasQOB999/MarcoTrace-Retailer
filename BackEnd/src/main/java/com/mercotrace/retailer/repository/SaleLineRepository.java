package com.mercotrace.retailer.repository;

import com.mercotrace.retailer.domain.SaleLine;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the SaleLine entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SaleLineRepository extends JpaRepository<SaleLine, Long> {}
