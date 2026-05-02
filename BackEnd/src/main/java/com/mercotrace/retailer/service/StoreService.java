package com.mercotrace.retailer.service;

import com.mercotrace.retailer.domain.Store;
import com.mercotrace.retailer.repository.StoreRepository;
import com.mercotrace.retailer.service.dto.StoreDTO;
import com.mercotrace.retailer.service.mapper.StoreMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.mercotrace.retailer.domain.Store}.
 */
@Service
@Transactional
public class StoreService {

    private static final Logger LOG = LoggerFactory.getLogger(StoreService.class);

    private final StoreRepository storeRepository;

    private final StoreMapper storeMapper;

    public StoreService(StoreRepository storeRepository, StoreMapper storeMapper) {
        this.storeRepository = storeRepository;
        this.storeMapper = storeMapper;
    }

    /**
     * Save a store.
     *
     * @param storeDTO the entity to save.
     * @return the persisted entity.
     */
    public StoreDTO save(StoreDTO storeDTO) {
        LOG.debug("Request to save Store : {}", storeDTO);
        Store store = storeMapper.toEntity(storeDTO);
        store = storeRepository.save(store);
        return storeMapper.toDto(store);
    }

    /**
     * Update a store.
     *
     * @param storeDTO the entity to save.
     * @return the persisted entity.
     */
    public StoreDTO update(StoreDTO storeDTO) {
        LOG.debug("Request to update Store : {}", storeDTO);
        Store store = storeMapper.toEntity(storeDTO);
        store = storeRepository.save(store);
        return storeMapper.toDto(store);
    }

    /**
     * Partially update a store.
     *
     * @param storeDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<StoreDTO> partialUpdate(StoreDTO storeDTO) {
        LOG.debug("Request to partially update Store : {}", storeDTO);

        return storeRepository
            .findById(storeDTO.getId())
            .map(existingStore -> {
                storeMapper.partialUpdate(existingStore, storeDTO);

                return existingStore;
            })
            .map(storeRepository::save)
            .map(storeMapper::toDto);
    }

    /**
     * Get all the stores.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<StoreDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Stores");
        return storeRepository.findAll(pageable).map(storeMapper::toDto);
    }

    /**
     * Get one store by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<StoreDTO> findOne(Long id) {
        LOG.debug("Request to get Store : {}", id);
        return storeRepository.findById(id).map(storeMapper::toDto);
    }

    /**
     * Delete the store by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Store : {}", id);
        storeRepository.deleteById(id);
    }
}
