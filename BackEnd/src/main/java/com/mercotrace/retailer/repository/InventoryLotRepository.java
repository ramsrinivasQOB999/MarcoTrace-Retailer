package com.mercotrace.retailer.repository;

import com.mercotrace.retailer.domain.InventoryLot;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the InventoryLot entity.
 */
@SuppressWarnings("unused")
@Repository
public interface InventoryLotRepository extends JpaRepository<InventoryLot, Long> {}
