package com.mercotrace.retailer;

import com.mercotrace.retailer.config.AsyncSyncConfiguration;
import com.mercotrace.retailer.config.DatabaseTestcontainer;
import com.mercotrace.retailer.config.JacksonConfiguration;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.context.ImportTestcontainers;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    classes = {
        MercotraceRetailerApp.class,
        JacksonConfiguration.class,
        AsyncSyncConfiguration.class,
        com.mercotrace.retailer.config.JacksonHibernateConfiguration.class,
    }
)
@ImportTestcontainers(DatabaseTestcontainer.class)
public @interface IntegrationTest {}
