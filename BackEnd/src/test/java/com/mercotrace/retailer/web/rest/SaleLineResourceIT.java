package com.mercotrace.retailer.web.rest;

import static com.mercotrace.retailer.domain.SaleLineAsserts.*;
import static com.mercotrace.retailer.web.rest.TestUtil.createUpdateProxyForBean;
import static com.mercotrace.retailer.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercotrace.retailer.IntegrationTest;
import com.mercotrace.retailer.domain.Sale;
import com.mercotrace.retailer.domain.SaleLine;
import com.mercotrace.retailer.domain.Sku;
import com.mercotrace.retailer.repository.SaleLineRepository;
import com.mercotrace.retailer.service.dto.SaleLineDTO;
import com.mercotrace.retailer.service.mapper.SaleLineMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
 * Integration tests for the {@link SaleLineResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class SaleLineResourceIT {

    private static final Integer DEFAULT_QTY = 1;
    private static final Integer UPDATED_QTY = 2;

    private static final BigDecimal DEFAULT_PRICE = new BigDecimal(1);
    private static final BigDecimal UPDATED_PRICE = new BigDecimal(2);

    private static final String ENTITY_API_URL = "/api/sale-lines";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private SaleLineRepository saleLineRepository;

    @Autowired
    private SaleLineMapper saleLineMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSaleLineMockMvc;

    private SaleLine saleLine;

    private SaleLine insertedSaleLine;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SaleLine createEntity(EntityManager em) {
        SaleLine saleLine = new SaleLine().qty(DEFAULT_QTY).price(DEFAULT_PRICE);
        // Add required entity
        Sale sale;
        if (TestUtil.findAll(em, Sale.class).isEmpty()) {
            sale = SaleResourceIT.createEntity(em);
            em.persist(sale);
            em.flush();
        } else {
            sale = TestUtil.findAll(em, Sale.class).get(0);
        }
        saleLine.setSale(sale);
        // Add required entity
        Sku sku;
        if (TestUtil.findAll(em, Sku.class).isEmpty()) {
            sku = SkuResourceIT.createEntity();
            em.persist(sku);
            em.flush();
        } else {
            sku = TestUtil.findAll(em, Sku.class).get(0);
        }
        saleLine.setSku(sku);
        return saleLine;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SaleLine createUpdatedEntity(EntityManager em) {
        SaleLine updatedSaleLine = new SaleLine().qty(UPDATED_QTY).price(UPDATED_PRICE);
        // Add required entity
        Sale sale;
        if (TestUtil.findAll(em, Sale.class).isEmpty()) {
            sale = SaleResourceIT.createUpdatedEntity(em);
            em.persist(sale);
            em.flush();
        } else {
            sale = TestUtil.findAll(em, Sale.class).get(0);
        }
        updatedSaleLine.setSale(sale);
        // Add required entity
        Sku sku;
        if (TestUtil.findAll(em, Sku.class).isEmpty()) {
            sku = SkuResourceIT.createUpdatedEntity();
            em.persist(sku);
            em.flush();
        } else {
            sku = TestUtil.findAll(em, Sku.class).get(0);
        }
        updatedSaleLine.setSku(sku);
        return updatedSaleLine;
    }

    @BeforeEach
    void initTest() {
        saleLine = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedSaleLine != null) {
            saleLineRepository.delete(insertedSaleLine);
            insertedSaleLine = null;
        }
    }

    @Test
    @Transactional
    void createSaleLine() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the SaleLine
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(saleLine);
        var returnedSaleLineDTO = om.readValue(
            restSaleLineMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(saleLineDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            SaleLineDTO.class
        );

        // Validate the SaleLine in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedSaleLine = saleLineMapper.toEntity(returnedSaleLineDTO);
        assertSaleLineUpdatableFieldsEquals(returnedSaleLine, getPersistedSaleLine(returnedSaleLine));

        insertedSaleLine = returnedSaleLine;
    }

    @Test
    @Transactional
    void createSaleLineWithExistingId() throws Exception {
        // Create the SaleLine with an existing ID
        saleLine.setId(1L);
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(saleLine);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSaleLineMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(saleLineDTO)))
            .andExpect(status().isBadRequest());

        // Validate the SaleLine in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkQtyIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        saleLine.setQty(null);

        // Create the SaleLine, which fails.
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(saleLine);

        restSaleLineMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(saleLineDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPriceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        saleLine.setPrice(null);

        // Create the SaleLine, which fails.
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(saleLine);

        restSaleLineMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(saleLineDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSaleLines() throws Exception {
        // Initialize the database
        insertedSaleLine = saleLineRepository.saveAndFlush(saleLine);

        // Get all the saleLineList
        restSaleLineMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(saleLine.getId().intValue())))
            .andExpect(jsonPath("$.[*].qty").value(hasItem(DEFAULT_QTY)))
            .andExpect(jsonPath("$.[*].price").value(hasItem(sameNumber(DEFAULT_PRICE))));
    }

    @Test
    @Transactional
    void getSaleLine() throws Exception {
        // Initialize the database
        insertedSaleLine = saleLineRepository.saveAndFlush(saleLine);

        // Get the saleLine
        restSaleLineMockMvc
            .perform(get(ENTITY_API_URL_ID, saleLine.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(saleLine.getId().intValue()))
            .andExpect(jsonPath("$.qty").value(DEFAULT_QTY))
            .andExpect(jsonPath("$.price").value(sameNumber(DEFAULT_PRICE)));
    }

    @Test
    @Transactional
    void getNonExistingSaleLine() throws Exception {
        // Get the saleLine
        restSaleLineMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingSaleLine() throws Exception {
        // Initialize the database
        insertedSaleLine = saleLineRepository.saveAndFlush(saleLine);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the saleLine
        SaleLine updatedSaleLine = saleLineRepository.findById(saleLine.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedSaleLine are not directly saved in db
        em.detach(updatedSaleLine);
        updatedSaleLine.qty(UPDATED_QTY).price(UPDATED_PRICE);
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(updatedSaleLine);

        restSaleLineMockMvc
            .perform(
                put(ENTITY_API_URL_ID, saleLineDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(saleLineDTO))
            )
            .andExpect(status().isOk());

        // Validate the SaleLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedSaleLineToMatchAllProperties(updatedSaleLine);
    }

    @Test
    @Transactional
    void putNonExistingSaleLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        saleLine.setId(longCount.incrementAndGet());

        // Create the SaleLine
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(saleLine);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSaleLineMockMvc
            .perform(
                put(ENTITY_API_URL_ID, saleLineDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(saleLineDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SaleLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSaleLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        saleLine.setId(longCount.incrementAndGet());

        // Create the SaleLine
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(saleLine);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSaleLineMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(saleLineDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SaleLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSaleLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        saleLine.setId(longCount.incrementAndGet());

        // Create the SaleLine
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(saleLine);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSaleLineMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(saleLineDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the SaleLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSaleLineWithPatch() throws Exception {
        // Initialize the database
        insertedSaleLine = saleLineRepository.saveAndFlush(saleLine);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the saleLine using partial update
        SaleLine partialUpdatedSaleLine = new SaleLine();
        partialUpdatedSaleLine.setId(saleLine.getId());

        restSaleLineMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSaleLine.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSaleLine))
            )
            .andExpect(status().isOk());

        // Validate the SaleLine in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSaleLineUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedSaleLine, saleLine), getPersistedSaleLine(saleLine));
    }

    @Test
    @Transactional
    void fullUpdateSaleLineWithPatch() throws Exception {
        // Initialize the database
        insertedSaleLine = saleLineRepository.saveAndFlush(saleLine);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the saleLine using partial update
        SaleLine partialUpdatedSaleLine = new SaleLine();
        partialUpdatedSaleLine.setId(saleLine.getId());

        partialUpdatedSaleLine.qty(UPDATED_QTY).price(UPDATED_PRICE);

        restSaleLineMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSaleLine.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSaleLine))
            )
            .andExpect(status().isOk());

        // Validate the SaleLine in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSaleLineUpdatableFieldsEquals(partialUpdatedSaleLine, getPersistedSaleLine(partialUpdatedSaleLine));
    }

    @Test
    @Transactional
    void patchNonExistingSaleLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        saleLine.setId(longCount.incrementAndGet());

        // Create the SaleLine
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(saleLine);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSaleLineMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, saleLineDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(saleLineDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SaleLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSaleLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        saleLine.setId(longCount.incrementAndGet());

        // Create the SaleLine
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(saleLine);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSaleLineMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(saleLineDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SaleLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSaleLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        saleLine.setId(longCount.incrementAndGet());

        // Create the SaleLine
        SaleLineDTO saleLineDTO = saleLineMapper.toDto(saleLine);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSaleLineMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(saleLineDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the SaleLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSaleLine() throws Exception {
        // Initialize the database
        insertedSaleLine = saleLineRepository.saveAndFlush(saleLine);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the saleLine
        restSaleLineMockMvc
            .perform(delete(ENTITY_API_URL_ID, saleLine.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return saleLineRepository.count();
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

    protected SaleLine getPersistedSaleLine(SaleLine saleLine) {
        return saleLineRepository.findById(saleLine.getId()).orElseThrow();
    }

    protected void assertPersistedSaleLineToMatchAllProperties(SaleLine expectedSaleLine) {
        assertSaleLineAllPropertiesEquals(expectedSaleLine, getPersistedSaleLine(expectedSaleLine));
    }

    protected void assertPersistedSaleLineToMatchUpdatableProperties(SaleLine expectedSaleLine) {
        assertSaleLineAllUpdatablePropertiesEquals(expectedSaleLine, getPersistedSaleLine(expectedSaleLine));
    }
}
