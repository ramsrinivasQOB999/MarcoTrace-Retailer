package com.mercotrace.retailer.service;

import com.mercotrace.retailer.domain.Sku;
import com.mercotrace.retailer.repository.SkuRepository;
import com.mercotrace.retailer.service.dto.SkuDTO;
import com.mercotrace.retailer.service.mapper.SkuMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.mercotrace.retailer.domain.Sku}.
 */
@Service
@Transactional
public class SkuService {

    private static final Logger LOG = LoggerFactory.getLogger(SkuService.class);

    private final SkuRepository skuRepository;

    private final SkuMapper skuMapper;

    public SkuService(SkuRepository skuRepository, SkuMapper skuMapper) {
        this.skuRepository = skuRepository;
        this.skuMapper = skuMapper;
    }

    /**
     * Save a sku.
     *
     * @param skuDTO the entity to save.
     * @return the persisted entity.
     */
    public SkuDTO save(SkuDTO skuDTO) {
        LOG.debug("Request to save Sku : {}", skuDTO);
        Sku sku = skuMapper.toEntity(skuDTO);
        sku = skuRepository.save(sku);
        return skuMapper.toDto(sku);
    }

    /**
     * Update a sku.
     *
     * @param skuDTO the entity to save.
     * @return the persisted entity.
     */
    public SkuDTO update(SkuDTO skuDTO) {
        LOG.debug("Request to update Sku : {}", skuDTO);
        Sku sku = skuMapper.toEntity(skuDTO);
        sku = skuRepository.save(sku);
        return skuMapper.toDto(sku);
    }

    /**
     * Partially update a sku.
     *
     * @param skuDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SkuDTO> partialUpdate(SkuDTO skuDTO) {
        LOG.debug("Request to partially update Sku : {}", skuDTO);

        return skuRepository
            .findById(skuDTO.getId())
            .map(existingSku -> {
                skuMapper.partialUpdate(existingSku, skuDTO);

                return existingSku;
            })
            .map(skuRepository::save)
            .map(skuMapper::toDto);
    }

    /**
     * Get all the skus.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<SkuDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Skus");
        return skuRepository.findAll(pageable).map(skuMapper::toDto);
    }

    /**
     * Get one sku by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SkuDTO> findOne(Long id) {
        LOG.debug("Request to get Sku : {}", id);
        return skuRepository.findById(id).map(skuMapper::toDto);
    }

    /**
     * Delete the sku by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Sku : {}", id);
        skuRepository.deleteById(id);
    }
}
