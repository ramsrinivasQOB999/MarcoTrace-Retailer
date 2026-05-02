package com.mercotrace.retailer.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class SaleLineTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static SaleLine getSaleLineSample1() {
        return new SaleLine().id(1L).qty(1);
    }

    public static SaleLine getSaleLineSample2() {
        return new SaleLine().id(2L).qty(2);
    }

    public static SaleLine getSaleLineRandomSampleGenerator() {
        return new SaleLine().id(longCount.incrementAndGet()).qty(intCount.incrementAndGet());
    }
}
