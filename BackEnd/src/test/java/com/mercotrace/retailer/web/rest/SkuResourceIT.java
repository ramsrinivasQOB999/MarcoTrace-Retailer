package com.mercotrace.retailer.web.rest;

import static com.mercotrace.retailer.domain.SkuAsserts.*;
import static com.mercotrace.retailer.web.rest.TestUtil.createUpdateProxyForBean;
import static com.mercotrace.retailer.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercotrace.retailer.IntegrationTest;
import com.mercotrace.retailer.domain.Sku;
import com.mercotrace.retailer.repository.SkuRepository;
import com.mercotrace.retailer.service.dto.SkuDTO;
import com.mercotrace.retailer.service.mapper.SkuMapper;
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
 * Integration tests for the {@link SkuResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class SkuResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_CATEGORY = "AAAAAAAAAA";
    private static final String UPDATED_CATEGORY = "BBBBBBBBBB";

    private static final String DEFAULT_HSN = "AAAAAAAAAA";
    private static final String UPDATED_HSN = "BBBBBBBBBB";

    private static final Integer DEFAULT_GST = 1;
    private static final Integer UPDATED_GST = 2;

    private static final String DEFAULT_UNIT = "AAAAAAAAAA";
    private static final String UPDATED_UNIT = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final BigDecimal DEFAULT_BASE_PRICE = new BigDecimal(1);
    private static final BigDecimal UPDATED_BASE_PRICE = new BigDecimal(2);

    private static final String ENTITY_API_URL = "/api/skus";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private SkuRepository skuRepository;

    @Autowired
    private SkuMapper skuMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSkuMockMvc;

    private Sku sku;

    private Sku insertedSku;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Sku createEntity() {
        return new Sku()
            .code(DEFAULT_CODE)
            .name(DEFAULT_NAME)
            .category(DEFAULT_CATEGORY)
            .hsn(DEFAULT_HSN)
            .gst(DEFAULT_GST)
            .unit(DEFAULT_UNIT)
            .active(DEFAULT_ACTIVE)
            .basePrice(DEFAULT_BASE_PRICE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Sku createUpdatedEntity() {
        return new Sku()
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .category(UPDATED_CATEGORY)
            .hsn(UPDATED_HSN)
            .gst(UPDATED_GST)
            .unit(UPDATED_UNIT)
            .active(UPDATED_ACTIVE)
            .basePrice(UPDATED_BASE_PRICE);
    }

    @BeforeEach
    void initTest() {
        sku = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedSku != null) {
            skuRepository.delete(insertedSku);
            insertedSku = null;
        }
    }

    @Test
    @Transactional
    void createSku() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Sku
        SkuDTO skuDTO = skuMapper.toDto(sku);
        var returnedSkuDTO = om.readValue(
            restSkuMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(skuDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            SkuDTO.class
        );

        // Validate the Sku in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedSku = skuMapper.toEntity(returnedSkuDTO);
        assertSkuUpdatableFieldsEquals(returnedSku, getPersistedSku(returnedSku));

        insertedSku = returnedSku;
    }

    @Test
    @Transactional
    void createSkuWithExistingId() throws Exception {
        // Create the Sku with an existing ID
        sku.setId(1L);
        SkuDTO skuDTO = skuMapper.toDto(sku);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSkuMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(skuDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Sku in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        sku.setCode(null);

        // Create the Sku, which fails.
        SkuDTO skuDTO = skuMapper.toDto(sku);

        restSkuMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(skuDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        sku.setName(null);

        // Create the Sku, which fails.
        SkuDTO skuDTO = skuMapper.toDto(sku);

        restSkuMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(skuDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkBasePriceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        sku.setBasePrice(null);

        // Create the Sku, which fails.
        SkuDTO skuDTO = skuMapper.toDto(sku);

        restSkuMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(skuDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSkus() throws Exception {
        // Initialize the database
        insertedSku = skuRepository.saveAndFlush(sku);

        // Get all the skuList
        restSkuMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(sku.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].category").value(hasItem(DEFAULT_CATEGORY)))
            .andExpect(jsonPath("$.[*].hsn").value(hasItem(DEFAULT_HSN)))
            .andExpect(jsonPath("$.[*].gst").value(hasItem(DEFAULT_GST)))
            .andExpect(jsonPath("$.[*].unit").value(hasItem(DEFAULT_UNIT)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)))
            .andExpect(jsonPath("$.[*].basePrice").value(hasItem(sameNumber(DEFAULT_BASE_PRICE))));
    }

    @Test
    @Transactional
    void getSku() throws Exception {
        // Initialize the database
        insertedSku = skuRepository.saveAndFlush(sku);

        // Get the sku
        restSkuMockMvc
            .perform(get(ENTITY_API_URL_ID, sku.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(sku.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.category").value(DEFAULT_CATEGORY))
            .andExpect(jsonPath("$.hsn").value(DEFAULT_HSN))
            .andExpect(jsonPath("$.gst").value(DEFAULT_GST))
            .andExpect(jsonPath("$.unit").value(DEFAULT_UNIT))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE))
            .andExpect(jsonPath("$.basePrice").value(sameNumber(DEFAULT_BASE_PRICE)));
    }

    @Test
    @Transactional
    void getNonExistingSku() throws Exception {
        // Get the sku
        restSkuMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingSku() throws Exception {
        // Initialize the database
        insertedSku = skuRepository.saveAndFlush(sku);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the sku
        Sku updatedSku = skuRepository.findById(sku.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedSku are not directly saved in db
        em.detach(updatedSku);
        updatedSku
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .category(UPDATED_CATEGORY)
            .hsn(UPDATED_HSN)
            .gst(UPDATED_GST)
            .unit(UPDATED_UNIT)
            .active(UPDATED_ACTIVE)
            .basePrice(UPDATED_BASE_PRICE);
        SkuDTO skuDTO = skuMapper.toDto(updatedSku);

        restSkuMockMvc
            .perform(put(ENTITY_API_URL_ID, skuDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(skuDTO)))
            .andExpect(status().isOk());

        // Validate the Sku in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedSkuToMatchAllProperties(updatedSku);
    }

    @Test
    @Transactional
    void putNonExistingSku() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sku.setId(longCount.incrementAndGet());

        // Create the Sku
        SkuDTO skuDTO = skuMapper.toDto(sku);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSkuMockMvc
            .perform(put(ENTITY_API_URL_ID, skuDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(skuDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Sku in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSku() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sku.setId(longCount.incrementAndGet());

        // Create the Sku
        SkuDTO skuDTO = skuMapper.toDto(sku);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSkuMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(skuDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sku in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSku() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sku.setId(longCount.incrementAndGet());

        // Create the Sku
        SkuDTO skuDTO = skuMapper.toDto(sku);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSkuMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(skuDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Sku in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSkuWithPatch() throws Exception {
        // Initialize the database
        insertedSku = skuRepository.saveAndFlush(sku);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the sku using partial update
        Sku partialUpdatedSku = new Sku();
        partialUpdatedSku.setId(sku.getId());

        partialUpdatedSku
            .name(UPDATED_NAME)
            .category(UPDATED_CATEGORY)
            .hsn(UPDATED_HSN)
            .gst(UPDATED_GST)
            .unit(UPDATED_UNIT)
            .active(UPDATED_ACTIVE);

        restSkuMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSku.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSku))
            )
            .andExpect(status().isOk());

        // Validate the Sku in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSkuUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedSku, sku), getPersistedSku(sku));
    }

    @Test
    @Transactional
    void fullUpdateSkuWithPatch() throws Exception {
        // Initialize the database
        insertedSku = skuRepository.saveAndFlush(sku);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the sku using partial update
        Sku partialUpdatedSku = new Sku();
        partialUpdatedSku.setId(sku.getId());

        partialUpdatedSku
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .category(UPDATED_CATEGORY)
            .hsn(UPDATED_HSN)
            .gst(UPDATED_GST)
            .unit(UPDATED_UNIT)
            .active(UPDATED_ACTIVE)
            .basePrice(UPDATED_BASE_PRICE);

        restSkuMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSku.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSku))
            )
            .andExpect(status().isOk());

        // Validate the Sku in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSkuUpdatableFieldsEquals(partialUpdatedSku, getPersistedSku(partialUpdatedSku));
    }

    @Test
    @Transactional
    void patchNonExistingSku() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sku.setId(longCount.incrementAndGet());

        // Create the Sku
        SkuDTO skuDTO = skuMapper.toDto(sku);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSkuMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, skuDTO.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(skuDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sku in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSku() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sku.setId(longCount.incrementAndGet());

        // Create the Sku
        SkuDTO skuDTO = skuMapper.toDto(sku);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSkuMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(skuDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Sku in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSku() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        sku.setId(longCount.incrementAndGet());

        // Create the Sku
        SkuDTO skuDTO = skuMapper.toDto(sku);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSkuMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(skuDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Sku in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSku() throws Exception {
        // Initialize the database
        insertedSku = skuRepository.saveAndFlush(sku);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the sku
        restSkuMockMvc.perform(delete(ENTITY_API_URL_ID, sku.getId()).accept(MediaType.APPLICATION_JSON)).andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return skuRepository.count();
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

    protected Sku getPersistedSku(Sku sku) {
        return skuRepository.findById(sku.getId()).orElseThrow();
    }

    protected void assertPersistedSkuToMatchAllProperties(Sku expectedSku) {
        assertSkuAllPropertiesEquals(expectedSku, getPersistedSku(expectedSku));
    }

    protected void assertPersistedSkuToMatchUpdatableProperties(Sku expectedSku) {
        assertSkuAllUpdatablePropertiesEquals(expectedSku, getPersistedSku(expectedSku));
    }
}
