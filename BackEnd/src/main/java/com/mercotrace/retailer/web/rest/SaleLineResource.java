package com.mercotrace.retailer.web.rest;

import com.mercotrace.retailer.repository.SaleLineRepository;
import com.mercotrace.retailer.service.SaleLineService;
import com.mercotrace.retailer.service.dto.SaleLineDTO;
import com.mercotrace.retailer.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for managing {@link com.mercotrace.retailer.domain.SaleLine}.
 */
@RestController
@RequestMapping("/api/sale-lines")
@Tag(name = "Sale lines", description = "Line items for sales")
public class SaleLineResource {

    private static final Logger LOG = LoggerFactory.getLogger(SaleLineResource.class);

    private static final String ENTITY_NAME = "saleLine";

    @Value("${jhipster.clientApp.name:mercotraceRetailer}")
    private String applicationName;

    private final SaleLineService saleLineService;

    private final SaleLineRepository saleLineRepository;

    public SaleLineResource(SaleLineService saleLineService, SaleLineRepository saleLineRepository) {
        this.saleLineService = saleLineService;
        this.saleLineRepository = saleLineRepository;
    }

    /**
     * {@code POST  /sale-lines} : Create a new saleLine.
     *
     * @param saleLineDTO the saleLineDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new saleLineDTO, or with status {@code 400 (Bad Request)} if the saleLine has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SaleLineDTO> createSaleLine(@Valid @RequestBody SaleLineDTO saleLineDTO) throws URISyntaxException {
        LOG.debug("REST request to save SaleLine : {}", saleLineDTO);
        if (saleLineDTO.getId() != null) {
            throw new BadRequestAlertException("A new saleLine cannot already have an ID", ENTITY_NAME, "idexists");
        }
        saleLineDTO = saleLineService.save(saleLineDTO);
        return ResponseEntity.created(new URI("/api/sale-lines/" + saleLineDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, saleLineDTO.getId().toString()))
            .body(saleLineDTO);
    }

    /**
     * {@code PUT  /sale-lines/:id} : Updates an existing saleLine.
     *
     * @param id the id of the saleLineDTO to save.
     * @param saleLineDTO the saleLineDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated saleLineDTO,
     * or with status {@code 400 (Bad Request)} if the saleLineDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the saleLineDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SaleLineDTO> updateSaleLine(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SaleLineDTO saleLineDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update SaleLine : {}, {}", id, saleLineDTO);
        if (saleLineDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, saleLineDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!saleLineRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        saleLineDTO = saleLineService.update(saleLineDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, saleLineDTO.getId().toString()))
            .body(saleLineDTO);
    }

    /**
     * {@code PATCH  /sale-lines/:id} : Partial updates given fields of an existing saleLine, field will ignore if it is null
     *
     * @param id the id of the saleLineDTO to save.
     * @param saleLineDTO the saleLineDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated saleLineDTO,
     * or with status {@code 400 (Bad Request)} if the saleLineDTO is not valid,
     * or with status {@code 404 (Not Found)} if the saleLineDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the saleLineDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SaleLineDTO> partialUpdateSaleLine(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SaleLineDTO saleLineDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update SaleLine partially : {}, {}", id, saleLineDTO);
        if (saleLineDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, saleLineDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!saleLineRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SaleLineDTO> result = saleLineService.partialUpdate(saleLineDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, saleLineDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /sale-lines} : get all the Sale Lines.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Sale Lines in body.
     */
    @GetMapping("")
    public List<SaleLineDTO> getAllSaleLines() {
        LOG.debug("REST request to get all SaleLines");
        return saleLineService.findAll();
    }

    /**
     * {@code GET  /sale-lines/:id} : get the "id" saleLine.
     *
     * @param id the id of the saleLineDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the saleLineDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SaleLineDTO> getSaleLine(@PathVariable("id") Long id) {
        LOG.debug("REST request to get SaleLine : {}", id);
        Optional<SaleLineDTO> saleLineDTO = saleLineService.findOne(id);
        return ResponseUtil.wrapOrNotFound(saleLineDTO);
    }

    /**
     * {@code DELETE  /sale-lines/:id} : delete the "id" saleLine.
     *
     * @param id the id of the saleLineDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSaleLine(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete SaleLine : {}", id);
        saleLineService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
