package com.mercotrace.retailer.service;

import com.mercotrace.retailer.domain.InventoryLot;
import com.mercotrace.retailer.repository.InventoryLotRepository;
import com.mercotrace.retailer.service.dto.InventoryLotDTO;
import com.mercotrace.retailer.service.mapper.InventoryLotMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.mercotrace.retailer.domain.InventoryLot}.
 */
@Service
@Transactional
public class InventoryLotService {

    private static final Logger LOG = LoggerFactory.getLogger(InventoryLotService.class);

    private final InventoryLotRepository inventoryLotRepository;

    private final InventoryLotMapper inventoryLotMapper;

    public InventoryLotService(InventoryLotRepository inventoryLotRepository, InventoryLotMapper inventoryLotMapper) {
        this.inventoryLotRepository = inventoryLotRepository;
        this.inventoryLotMapper = inventoryLotMapper;
    }

    /**
     * Save a inventoryLot.
     *
     * @param inventoryLotDTO the entity to save.
     * @return the persisted entity.
     */
    public InventoryLotDTO save(InventoryLotDTO inventoryLotDTO) {
        LOG.debug("Request to save InventoryLot : {}", inventoryLotDTO);
        InventoryLot inventoryLot = inventoryLotMapper.toEntity(inventoryLotDTO);
        inventoryLot = inventoryLotRepository.save(inventoryLot);
        return inventoryLotMapper.toDto(inventoryLot);
    }

    /**
     * Update a inventoryLot.
     *
     * @param inventoryLotDTO the entity to save.
     * @return the persisted entity.
     */
    public InventoryLotDTO update(InventoryLotDTO inventoryLotDTO) {
        LOG.debug("Request to update InventoryLot : {}", inventoryLotDTO);
        InventoryLot inventoryLot = inventoryLotMapper.toEntity(inventoryLotDTO);
        inventoryLot = inventoryLotRepository.save(inventoryLot);
        return inventoryLotMapper.toDto(inventoryLot);
    }

    /**
     * Partially update a inventoryLot.
     *
     * @param inventoryLotDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<InventoryLotDTO> partialUpdate(InventoryLotDTO inventoryLotDTO) {
        LOG.debug("Request to partially update InventoryLot : {}", inventoryLotDTO);

        return inventoryLotRepository
            .findById(inventoryLotDTO.getId())
            .map(existingInventoryLot -> {
                inventoryLotMapper.partialUpdate(existingInventoryLot, inventoryLotDTO);

                return existingInventoryLot;
            })
            .map(inventoryLotRepository::save)
            .map(inventoryLotMapper::toDto);
    }

    /**
     * Get all the inventoryLots.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<InventoryLotDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all InventoryLots");
        return inventoryLotRepository.findAll(pageable).map(inventoryLotMapper::toDto);
    }

    /**
     * Get one inventoryLot by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<InventoryLotDTO> findOne(Long id) {
        LOG.debug("Request to get InventoryLot : {}", id);
        return inventoryLotRepository.findById(id).map(inventoryLotMapper::toDto);
    }

    /**
     * Delete the inventoryLot by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete InventoryLot : {}", id);
        inventoryLotRepository.deleteById(id);
    }
}
