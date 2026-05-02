package com.mercotrace.retailer.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class InventoryLotTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static InventoryLot getInventoryLotSample1() {
        return new InventoryLot().id(1L).qty(1).remaining(1).supplier("supplier1").invoiceNo("invoiceNo1");
    }

    public static InventoryLot getInventoryLotSample2() {
        return new InventoryLot().id(2L).qty(2).remaining(2).supplier("supplier2").invoiceNo("invoiceNo2");
    }

    public static InventoryLot getInventoryLotRandomSampleGenerator() {
        return new InventoryLot()
            .id(longCount.incrementAndGet())
            .qty(intCount.incrementAndGet())
            .remaining(intCount.incrementAndGet())
            .supplier(UUID.randomUUID().toString())
            .invoiceNo(UUID.randomUUID().toString());
    }
}
