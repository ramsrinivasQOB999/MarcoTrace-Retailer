package com.mercotrace.retailer.web.rest;

import static com.mercotrace.retailer.domain.InventoryLotAsserts.*;
import static com.mercotrace.retailer.web.rest.TestUtil.createUpdateProxyForBean;
import static com.mercotrace.retailer.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercotrace.retailer.IntegrationTest;
import com.mercotrace.retailer.domain.InventoryLot;
import com.mercotrace.retailer.domain.Sku;
import com.mercotrace.retailer.domain.Store;
import com.mercotrace.retailer.repository.InventoryLotRepository;
import com.mercotrace.retailer.service.dto.InventoryLotDTO;
import com.mercotrace.retailer.service.mapper.InventoryLotMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link InventoryLotResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class InventoryLotResourceIT {

    private static final Integer DEFAULT_QTY = 1;
    private static final Integer UPDATED_QTY = 2;

    private static final Integer DEFAULT_REMAINING = 1;
    private static final Integer UPDATED_REMAINING = 2;

    private static final BigDecimal DEFAULT_COST_PRICE = new BigDecimal(1);
    private static final BigDecimal UPDATED_COST_PRICE = new BigDecimal(2);

    private static final BigDecimal DEFAULT_SELL_PRICE = new BigDecimal(1);
    private static final BigDecimal UPDATED_SELL_PRICE = new BigDecimal(2);

    private static final Instant DEFAULT_PURCHASE_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_PURCHASE_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_EXPIRY_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_EXPIRY_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_SUPPLIER = "AAAAAAAAAA";
    private static final String UPDATED_SUPPLIER = "BBBBBBBBBB";

    private static final String DEFAULT_INVOICE_NO = "AAAAAAAAAA";
    private static final String UPDATED_INVOICE_NO = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/inventory-lots";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private InventoryLotRepository inventoryLotRepository;

    @Autowired
    private InventoryLotMapper inventoryLotMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restInventoryLotMockMvc;

    private InventoryLot inventoryLot;

    private InventoryLot insertedInventoryLot;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static InventoryLot createEntity(EntityManager em) {
        InventoryLot inventoryLot = new InventoryLot()
            .qty(DEFAULT_QTY)
            .remaining(DEFAULT_REMAINING)
            .costPrice(DEFAULT_COST_PRICE)
            .sellPrice(DEFAULT_SELL_PRICE)
            .purchaseDate(DEFAULT_PURCHASE_DATE)
            .expiryDate(DEFAULT_EXPIRY_DATE)
            .supplier(DEFAULT_SUPPLIER)
            .invoiceNo(DEFAULT_INVOICE_NO);
        // Add required entity
        Sku sku;
        if (TestUtil.findAll(em, Sku.class).isEmpty()) {
            sku = SkuResourceIT.createEntity();
            em.persist(sku);
            em.flush();
        } else {
            sku = TestUtil.findAll(em, Sku.class).get(0);
        }
        inventoryLot.setSku(sku);
        // Add required entity
        Store store;
        if (TestUtil.findAll(em, Store.class).isEmpty()) {
            store = StoreResourceIT.createEntity();
            em.persist(store);
            em.flush();
        } else {
            store = TestUtil.findAll(em, Store.class).get(0);
        }
        inventoryLot.setStore(store);
        return inventoryLot;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static InventoryLot createUpdatedEntity(EntityManager em) {
        InventoryLot updatedInventoryLot = new InventoryLot()
            .qty(UPDATED_QTY)
            .remaining(UPDATED_REMAINING)
            .costPrice(UPDATED_COST_PRICE)
            .sellPrice(UPDATED_SELL_PRICE)
            .purchaseDate(UPDATED_PURCHASE_DATE)
            .expiryDate(UPDATED_EXPIRY_DATE)
            .supplier(UPDATED_SUPPLIER)
            .invoiceNo(UPDATED_INVOICE_NO);
        // Add required entity
        Sku sku;
        if (TestUtil.findAll(em, Sku.class).isEmpty()) {
            sku = SkuResourceIT.createUpdatedEntity();
            em.persist(sku);
            em.flush();
        } else {
            sku = TestUtil.findAll(em, Sku.class).get(0);
        }
        updatedInventoryLot.setSku(sku);
        // Add required entity
        Store store;
        if (TestUtil.findAll(em, Store.class).isEmpty()) {
            store = StoreResourceIT.createUpdatedEntity();
            em.persist(store);
            em.flush();
        } else {
            store = TestUtil.findAll(em, Store.class).get(0);
        }
        updatedInventoryLot.setStore(store);
        return updatedInventoryLot;
    }

    @BeforeEach
    void initTest() {
        inventoryLot = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedInventoryLot != null) {
            inventoryLotRepository.delete(insertedInventoryLot);
            insertedInventoryLot = null;
        }
    }

    @Test
    @Transactional
    void createInventoryLot() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the InventoryLot
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);
        var returnedInventoryLotDTO = om.readValue(
            restInventoryLotMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(inventoryLotDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            InventoryLotDTO.class
        );

        // Validate the InventoryLot in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedInventoryLot = inventoryLotMapper.toEntity(returnedInventoryLotDTO);
        assertInventoryLotUpdatableFieldsEquals(returnedInventoryLot, getPersistedInventoryLot(returnedInventoryLot));

        insertedInventoryLot = returnedInventoryLot;
    }

    @Test
    @Transactional
    void createInventoryLotWithExistingId() throws Exception {
        // Create the InventoryLot with an existing ID
        inventoryLot.setId(1L);
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restInventoryLotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(inventoryLotDTO)))
            .andExpect(status().isBadRequest());

        // Validate the InventoryLot in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkQtyIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        inventoryLot.setQty(null);

        // Create the InventoryLot, which fails.
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        restInventoryLotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(inventoryLotDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRemainingIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        inventoryLot.setRemaining(null);

        // Create the InventoryLot, which fails.
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        restInventoryLotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(inventoryLotDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCostPriceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        inventoryLot.setCostPrice(null);

        // Create the InventoryLot, which fails.
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        restInventoryLotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(inventoryLotDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSellPriceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        inventoryLot.setSellPrice(null);

        // Create the InventoryLot, which fails.
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        restInventoryLotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(inventoryLotDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPurchaseDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        inventoryLot.setPurchaseDate(null);

        // Create the InventoryLot, which fails.
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        restInventoryLotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(inventoryLotDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkExpiryDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        inventoryLot.setExpiryDate(null);

        // Create the InventoryLot, which fails.
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        restInventoryLotMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(inventoryLotDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllInventoryLots() throws Exception {
        // Initialize the database
        insertedInventoryLot = inventoryLotRepository.saveAndFlush(inventoryLot);

        // Get all the inventoryLotList
        restInventoryLotMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(inventoryLot.getId().intValue())))
            .andExpect(jsonPath("$.[*].qty").value(hasItem(DEFAULT_QTY)))
            .andExpect(jsonPath("$.[*].remaining").value(hasItem(DEFAULT_REMAINING)))
            .andExpect(jsonPath("$.[*].costPrice").value(hasItem(sameNumber(DEFAULT_COST_PRICE))))
            .andExpect(jsonPath("$.[*].sellPrice").value(hasItem(sameNumber(DEFAULT_SELL_PRICE))))
            .andExpect(jsonPath("$.[*].purchaseDate").value(hasItem(DEFAULT_PURCHASE_DATE.toString())))
            .andExpect(jsonPath("$.[*].expiryDate").value(hasItem(DEFAULT_EXPIRY_DATE.toString())))
            .andExpect(jsonPath("$.[*].supplier").value(hasItem(DEFAULT_SUPPLIER)))
            .andExpect(jsonPath("$.[*].invoiceNo").value(hasItem(DEFAULT_INVOICE_NO)));
    }

    @Test
    @Transactional
    void getInventoryLot() throws Exception {
        // Initialize the database
        insertedInventoryLot = inventoryLotRepository.saveAndFlush(inventoryLot);

        // Get the inventoryLot
        restInventoryLotMockMvc
            .perform(get(ENTITY_API_URL_ID, inventoryLot.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(inventoryLot.getId().intValue()))
            .andExpect(jsonPath("$.qty").value(DEFAULT_QTY))
            .andExpect(jsonPath("$.remaining").value(DEFAULT_REMAINING))
            .andExpect(jsonPath("$.costPrice").value(sameNumber(DEFAULT_COST_PRICE)))
            .andExpect(jsonPath("$.sellPrice").value(sameNumber(DEFAULT_SELL_PRICE)))
            .andExpect(jsonPath("$.purchaseDate").value(DEFAULT_PURCHASE_DATE.toString()))
            .andExpect(jsonPath("$.expiryDate").value(DEFAULT_EXPIRY_DATE.toString()))
            .andExpect(jsonPath("$.supplier").value(DEFAULT_SUPPLIER))
            .andExpect(jsonPath("$.invoiceNo").value(DEFAULT_INVOICE_NO));
    }

    @Test
    @Transactional
    void getNonExistingInventoryLot() throws Exception {
        // Get the inventoryLot
        restInventoryLotMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingInventoryLot() throws Exception {
        // Initialize the database
        insertedInventoryLot = inventoryLotRepository.saveAndFlush(inventoryLot);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the inventoryLot
        InventoryLot updatedInventoryLot = inventoryLotRepository.findById(inventoryLot.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedInventoryLot are not directly saved in db
        em.detach(updatedInventoryLot);
        updatedInventoryLot
            .qty(UPDATED_QTY)
            .remaining(UPDATED_REMAINING)
            .costPrice(UPDATED_COST_PRICE)
            .sellPrice(UPDATED_SELL_PRICE)
            .purchaseDate(UPDATED_PURCHASE_DATE)
            .expiryDate(UPDATED_EXPIRY_DATE)
            .supplier(UPDATED_SUPPLIER)
            .invoiceNo(UPDATED_INVOICE_NO);
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(updatedInventoryLot);

        restInventoryLotMockMvc
            .perform(
                put(ENTITY_API_URL_ID, inventoryLotDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(inventoryLotDTO))
            )
            .andExpect(status().isOk());

        // Validate the InventoryLot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedInventoryLotToMatchAllProperties(updatedInventoryLot);
    }

    @Test
    @Transactional
    void putNonExistingInventoryLot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        inventoryLot.setId(longCount.incrementAndGet());

        // Create the InventoryLot
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restInventoryLotMockMvc
            .perform(
                put(ENTITY_API_URL_ID, inventoryLotDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(inventoryLotDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the InventoryLot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchInventoryLot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        inventoryLot.setId(longCount.incrementAndGet());

        // Create the InventoryLot
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInventoryLotMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(inventoryLotDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the InventoryLot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamInventoryLot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        inventoryLot.setId(longCount.incrementAndGet());

        // Create the InventoryLot
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInventoryLotMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(inventoryLotDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the InventoryLot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateInventoryLotWithPatch() throws Exception {
        // Initialize the database
        insertedInventoryLot = inventoryLotRepository.saveAndFlush(inventoryLot);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the inventoryLot using partial update
        InventoryLot partialUpdatedInventoryLot = new InventoryLot();
        partialUpdatedInventoryLot.setId(inventoryLot.getId());

        partialUpdatedInventoryLot
            .qty(UPDATED_QTY)
            .costPrice(UPDATED_COST_PRICE)
            .sellPrice(UPDATED_SELL_PRICE)
            .purchaseDate(UPDATED_PURCHASE_DATE)
            .supplier(UPDATED_SUPPLIER)
            .invoiceNo(UPDATED_INVOICE_NO);

        restInventoryLotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedInventoryLot.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedInventoryLot))
            )
            .andExpect(status().isOk());

        // Validate the InventoryLot in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertInventoryLotUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedInventoryLot, inventoryLot),
            getPersistedInventoryLot(inventoryLot)
        );
    }

    @Test
    @Transactional
    void fullUpdateInventoryLotWithPatch() throws Exception {
        // Initialize the database
        insertedInventoryLot = inventoryLotRepository.saveAndFlush(inventoryLot);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the inventoryLot using partial update
        InventoryLot partialUpdatedInventoryLot = new InventoryLot();
        partialUpdatedInventoryLot.setId(inventoryLot.getId());

        partialUpdatedInventoryLot
            .qty(UPDATED_QTY)
            .remaining(UPDATED_REMAINING)
            .costPrice(UPDATED_COST_PRICE)
            .sellPrice(UPDATED_SELL_PRICE)
            .purchaseDate(UPDATED_PURCHASE_DATE)
            .expiryDate(UPDATED_EXPIRY_DATE)
            .supplier(UPDATED_SUPPLIER)
            .invoiceNo(UPDATED_INVOICE_NO);

        restInventoryLotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedInventoryLot.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedInventoryLot))
            )
            .andExpect(status().isOk());

        // Validate the InventoryLot in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertInventoryLotUpdatableFieldsEquals(partialUpdatedInventoryLot, getPersistedInventoryLot(partialUpdatedInventoryLot));
    }

    @Test
    @Transactional
    void patchNonExistingInventoryLot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        inventoryLot.setId(longCount.incrementAndGet());

        // Create the InventoryLot
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restInventoryLotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, inventoryLotDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(inventoryLotDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the InventoryLot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchInventoryLot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        inventoryLot.setId(longCount.incrementAndGet());

        // Create the InventoryLot
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInventoryLotMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(inventoryLotDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the InventoryLot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamInventoryLot() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        inventoryLot.setId(longCount.incrementAndGet());

        // Create the InventoryLot
        InventoryLotDTO inventoryLotDTO = inventoryLotMapper.toDto(inventoryLot);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInventoryLotMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(inventoryLotDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the InventoryLot in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteInventoryLot() throws Exception {
        // Initialize the database
        insertedInventoryLot = inventoryLotRepository.saveAndFlush(inventoryLot);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the inventoryLot
        restInventoryLotMockMvc
            .perform(delete(ENTITY_API_URL_ID, inventoryLot.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return inventoryLotRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected InventoryLot getPersistedInventoryLot(InventoryLot inventoryLot) {
        return inventoryLotRepository.findById(inventoryLot.getId()).orElseThrow();
    }

    protected void assertPersistedInventoryLotToMatchAllProperties(InventoryLot expectedInventoryLot) {
        assertInventoryLotAllPropertiesEquals(expectedInventoryLot, getPersistedInventoryLot(expectedInventoryLot));
    }

    protected void assertPersistedInventoryLotToMatchUpdatableProperties(InventoryLot expectedInventoryLot) {
        assertInventoryLotAllUpdatablePropertiesEquals(expectedInventoryLot, getPersistedInventoryLot(expectedInventoryLot));
    }
}
