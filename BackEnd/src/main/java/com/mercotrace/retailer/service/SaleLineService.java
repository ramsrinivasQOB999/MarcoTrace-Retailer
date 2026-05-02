package com.mercotrace.retailer.service;

import com.mercotrace.retailer.domain.SaleLine;
import com.mercotrace.retailer.repository.SaleLineRepository;
import com.mercotrace.retailer.service.dto.SaleLineDTO;
import com.mercotrace.retailer.service.mapper.SaleLineMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.mercotrace.retailer.domain.SaleLine}.
 */
@Service
@Transactional
public class SaleLineService {

    private static final Logger LOG = LoggerFactory.getLogger(SaleLineService.class);

    private final SaleLineRepository saleLineRepository;

    private final SaleLineMapper saleLineMapper;

    public SaleLineService(SaleLineRepository saleLineRepository, SaleLineMapper saleLineMapper) {
        this.saleLineRepository = saleLineRepository;
        this.saleLineMapper = saleLineMapper;
    }

    /**
     * Save a saleLine.
     *
     * @param saleLineDTO the entity to save.
     * @return the persisted entity.
     */
    public SaleLineDTO save(SaleLineDTO saleLineDTO) {
        LOG.debug("Request to save SaleLine : {}", saleLineDTO);
        SaleLine saleLine = saleLineMapper.toEntity(saleLineDTO);
        saleLine = saleLineRepository.save(saleLine);
        return saleLineMapper.toDto(saleLine);
    }

    /**
     * Update a saleLine.
     *
     * @param saleLineDTO the entity to save.
     * @return the persisted entity.
     */
    public SaleLineDTO update(SaleLineDTO saleLineDTO) {
        LOG.debug("Request to update SaleLine : {}", saleLineDTO);
        SaleLine saleLine = saleLineMapper.toEntity(saleLineDTO);
        saleLine = saleLineRepository.save(saleLine);
        return saleLineMapper.toDto(saleLine);
    }

    /**
     * Partially update a saleLine.
     *
     * @param saleLineDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<SaleLineDTO> partialUpdate(SaleLineDTO saleLineDTO) {
        LOG.debug("Request to partially update SaleLine : {}", saleLineDTO);

        return saleLineRepository
            .findById(saleLineDTO.getId())
            .map(existingSaleLine -> {
                saleLineMapper.partialUpdate(existingSaleLine, saleLineDTO);

                return existingSaleLine;
            })
            .map(saleLineRepository::save)
            .map(saleLineMapper::toDto);
    }

    /**
     * Get all the saleLines.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<SaleLineDTO> findAll() {
        LOG.debug("Request to get all SaleLines");
        return saleLineRepository.findAll().stream().map(saleLineMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one saleLine by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<SaleLineDTO> findOne(Long id) {
        LOG.debug("Request to get SaleLine : {}", id);
        return saleLineRepository.findById(id).map(saleLineMapper::toDto);
    }

    /**
     * Delete the saleLine by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete SaleLine : {}", id);
        saleLineRepository.deleteById(id);
    }
}
