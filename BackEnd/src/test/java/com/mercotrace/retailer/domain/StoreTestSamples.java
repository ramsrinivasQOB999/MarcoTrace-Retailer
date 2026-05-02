package com.mercotrace.retailer.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class StoreTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static Store getStoreSample1() {
        return new Store().id(1L).code("code1").name("name1").city("city1").agglomeration("agglomeration1").owner("owner1").phone("phone1");
    }

    public static Store getStoreSample2() {
        return new Store().id(2L).code("code2").name("name2").city("city2").agglomeration("agglomeration2").owner("owner2").phone("phone2");
    }

    public static Store getStoreRandomSampleGenerator() {
        return new Store()
            .id(longCount.incrementAndGet())
            .code(UUID.randomUUID().toString())
            .name(UUID.randomUUID().toString())
            .city(UUID.randomUUID().toString())
            .agglomeration(UUID.randomUUID().toString())
            .owner(UUID.randomUUID().toString())
            .phone(UUID.randomUUID().toString());
    }
}
