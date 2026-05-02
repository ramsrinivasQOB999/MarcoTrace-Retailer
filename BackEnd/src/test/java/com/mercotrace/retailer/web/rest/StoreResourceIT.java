package com.mercotrace.retailer.web.rest;

import static com.mercotrace.retailer.domain.StoreAsserts.*;
import static com.mercotrace.retailer.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mercotrace.retailer.IntegrationTest;
import com.mercotrace.retailer.domain.Store;
import com.mercotrace.retailer.domain.enumeration.StoreStatus;
import com.mercotrace.retailer.repository.StoreRepository;
import com.mercotrace.retailer.service.dto.StoreDTO;
import com.mercotrace.retailer.service.mapper.StoreMapper;
import jakarta.persistence.EntityManager;
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
 * Integration tests for the {@link StoreResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class StoreResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_CITY = "AAAAAAAAAA";
    private static final String UPDATED_CITY = "BBBBBBBBBB";

    private static final String DEFAULT_AGGLOMERATION = "AAAAAAAAAA";
    private static final String UPDATED_AGGLOMERATION = "BBBBBBBBBB";

    private static final StoreStatus DEFAULT_STATUS = StoreStatus.ACTIVE;
    private static final StoreStatus UPDATED_STATUS = StoreStatus.PENDING;

    private static final String DEFAULT_OWNER = "AAAAAAAAAA";
    private static final String UPDATED_OWNER = "BBBBBBBBBB";

    private static final String DEFAULT_PHONE = "AAAAAAAAAA";
    private static final String UPDATED_PHONE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/stores";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private StoreMapper storeMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restStoreMockMvc;

    private Store store;

    private Store insertedStore;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Store createEntity() {
        return new Store()
            .code(DEFAULT_CODE)
            .name(DEFAULT_NAME)
            .city(DEFAULT_CITY)
            .agglomeration(DEFAULT_AGGLOMERATION)
            .status(DEFAULT_STATUS)
            .owner(DEFAULT_OWNER)
            .phone(DEFAULT_PHONE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Store createUpdatedEntity() {
        return new Store()
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .city(UPDATED_CITY)
            .agglomeration(UPDATED_AGGLOMERATION)
            .status(UPDATED_STATUS)
            .owner(UPDATED_OWNER)
            .phone(UPDATED_PHONE);
    }

    @BeforeEach
    void initTest() {
        store = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedStore != null) {
            storeRepository.delete(insertedStore);
            insertedStore = null;
        }
    }

    @Test
    @Transactional
    void createStore() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Store
        StoreDTO storeDTO = storeMapper.toDto(store);
        var returnedStoreDTO = om.readValue(
            restStoreMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(storeDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            StoreDTO.class
        );

        // Validate the Store in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedStore = storeMapper.toEntity(returnedStoreDTO);
        assertStoreUpdatableFieldsEquals(returnedStore, getPersistedStore(returnedStore));

        insertedStore = returnedStore;
    }

    @Test
    @Transactional
    void createStoreWithExistingId() throws Exception {
        // Create the Store with an existing ID
        store.setId(1L);
        StoreDTO storeDTO = storeMapper.toDto(store);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restStoreMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(storeDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Store in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        store.setCode(null);

        // Create the Store, which fails.
        StoreDTO storeDTO = storeMapper.toDto(store);

        restStoreMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(storeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        store.setName(null);

        // Create the Store, which fails.
        StoreDTO storeDTO = storeMapper.toDto(store);

        restStoreMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(storeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        store.setStatus(null);

        // Create the Store, which fails.
        StoreDTO storeDTO = storeMapper.toDto(store);

        restStoreMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(storeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllStores() throws Exception {
        // Initialize the database
        insertedStore = storeRepository.saveAndFlush(store);

        // Get all the storeList
        restStoreMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(store.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].city").value(hasItem(DEFAULT_CITY)))
            .andExpect(jsonPath("$.[*].agglomeration").value(hasItem(DEFAULT_AGGLOMERATION)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].owner").value(hasItem(DEFAULT_OWNER)))
            .andExpect(jsonPath("$.[*].phone").value(hasItem(DEFAULT_PHONE)));
    }

    @Test
    @Transactional
    void getStore() throws Exception {
        // Initialize the database
        insertedStore = storeRepository.saveAndFlush(store);

        // Get the store
        restStoreMockMvc
            .perform(get(ENTITY_API_URL_ID, store.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(store.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.city").value(DEFAULT_CITY))
            .andExpect(jsonPath("$.agglomeration").value(DEFAULT_AGGLOMERATION))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.owner").value(DEFAULT_OWNER))
            .andExpect(jsonPath("$.phone").value(DEFAULT_PHONE));
    }

    @Test
    @Transactional
    void getNonExistingStore() throws Exception {
        // Get the store
        restStoreMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingStore() throws Exception {
        // Initialize the database
        insertedStore = storeRepository.saveAndFlush(store);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the store
        Store updatedStore = storeRepository.findById(store.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedStore are not directly saved in db
        em.detach(updatedStore);
        updatedStore
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .city(UPDATED_CITY)
            .agglomeration(UPDATED_AGGLOMERATION)
            .status(UPDATED_STATUS)
            .owner(UPDATED_OWNER)
            .phone(UPDATED_PHONE);
        StoreDTO storeDTO = storeMapper.toDto(updatedStore);

        restStoreMockMvc
            .perform(
                put(ENTITY_API_URL_ID, storeDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(storeDTO))
            )
            .andExpect(status().isOk());

        // Validate the Store in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedStoreToMatchAllProperties(updatedStore);
    }

    @Test
    @Transactional
    void putNonExistingStore() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        store.setId(longCount.incrementAndGet());

        // Create the Store
        StoreDTO storeDTO = storeMapper.toDto(store);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restStoreMockMvc
            .perform(
                put(ENTITY_API_URL_ID, storeDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(storeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Store in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchStore() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        store.setId(longCount.incrementAndGet());

        // Create the Store
        StoreDTO storeDTO = storeMapper.toDto(store);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStoreMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(storeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Store in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamStore() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        store.setId(longCount.incrementAndGet());

        // Create the Store
        StoreDTO storeDTO = storeMapper.toDto(store);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStoreMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(storeDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Store in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateStoreWithPatch() throws Exception {
        // Initialize the database
        insertedStore = storeRepository.saveAndFlush(store);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the store using partial update
        Store partialUpdatedStore = new Store();
        partialUpdatedStore.setId(store.getId());

        partialUpdatedStore.city(UPDATED_CITY).agglomeration(UPDATED_AGGLOMERATION).phone(UPDATED_PHONE);

        restStoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedStore.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedStore))
            )
            .andExpect(status().isOk());

        // Validate the Store in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertStoreUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedStore, store), getPersistedStore(store));
    }

    @Test
    @Transactional
    void fullUpdateStoreWithPatch() throws Exception {
        // Initialize the database
        insertedStore = storeRepository.saveAndFlush(store);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the store using partial update
        Store partialUpdatedStore = new Store();
        partialUpdatedStore.setId(store.getId());

        partialUpdatedStore
            .code(UPDATED_CODE)
            .name(UPDATED_NAME)
            .city(UPDATED_CITY)
            .agglomeration(UPDATED_AGGLOMERATION)
            .status(UPDATED_STATUS)
            .owner(UPDATED_OWNER)
            .phone(UPDATED_PHONE);

        restStoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedStore.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedStore))
            )
            .andExpect(status().isOk());

        // Validate the Store in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertStoreUpdatableFieldsEquals(partialUpdatedStore, getPersistedStore(partialUpdatedStore));
    }

    @Test
    @Transactional
    void patchNonExistingStore() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        store.setId(longCount.incrementAndGet());

        // Create the Store
        StoreDTO storeDTO = storeMapper.toDto(store);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restStoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, storeDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(storeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Store in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchStore() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        store.setId(longCount.incrementAndGet());

        // Create the Store
        StoreDTO storeDTO = storeMapper.toDto(store);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStoreMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(storeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Store in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamStore() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        store.setId(longCount.incrementAndGet());

        // Create the Store
        StoreDTO storeDTO = storeMapper.toDto(store);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStoreMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(storeDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Store in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteStore() throws Exception {
        // Initialize the database
        insertedStore = storeRepository.saveAndFlush(store);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the store
        restStoreMockMvc
            .perform(delete(ENTITY_API_URL_ID, store.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return storeRepository.count();
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

    protected Store getPersistedStore(Store store) {
        return storeRepository.findById(store.getId()).orElseThrow();
    }

    protected void assertPersistedStoreToMatchAllProperties(Store expectedStore) {
        assertStoreAllPropertiesEquals(expectedStore, getPersistedStore(expectedStore));
    }

    protected void assertPersistedStoreToMatchUpdatableProperties(Store expectedStore) {
        assertStoreAllUpdatablePropertiesEquals(expectedStore, getPersistedStore(expectedStore));
    }
}
