package com.mercotrace.retailer.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class SkuTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Sku getSkuSample1() {
        return new Sku().id(1L).code("code1").name("name1").category("category1").hsn("hsn1").gst(1).unit("unit1");
    }

    public static Sku getSkuSample2() {
        return new Sku().id(2L).code("code2").name("name2").category("category2").hsn("hsn2").gst(2).unit("unit2");
    }

    public static Sku getSkuRandomSampleGenerator() {
        return new Sku()
            .id(longCount.incrementAndGet())
            .code(UUID.randomUUID().toString())
            .name(UUID.randomUUID().toString())
            .category(UUID.randomUUID().toString())
            .hsn(UUID.randomUUID().toString())
            .gst(intCount.incrementAndGet())
            .unit(UUID.randomUUID().toString());
    }
}
