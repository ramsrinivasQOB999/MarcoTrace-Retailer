package com.mercotrace.retailer.web.rest;

import com.mercotrace.retailer.repository.InventoryLotRepository;
import com.mercotrace.retailer.service.InventoryLotService;
import com.mercotrace.retailer.service.dto.InventoryLotDTO;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * REST controller for managing {@link com.mercotrace.retailer.domain.InventoryLot}.
 */
@RestController
@RequestMapping("/api/inventory-lots")
@Tag(name = "Inventory lots", description = "Lot-level stock and expiry tracking")
public class InventoryLotResource {

    private static final Logger LOG = LoggerFactory.getLogger(InventoryLotResource.class);

    private static final String ENTITY_NAME = "inventoryLot";

    @Value("${jhipster.clientApp.name:mercotraceRetailer}")
    private String applicationName;

    private final InventoryLotService inventoryLotService;

    private final InventoryLotRepository inventoryLotRepository;

    public InventoryLotResource(InventoryLotService inventoryLotService, InventoryLotRepository inventoryLotRepository) {
        this.inventoryLotService = inventoryLotService;
        this.inventoryLotRepository = inventoryLotRepository;
    }

    /**
     * {@code POST  /inventory-lots} : Create a new inventoryLot.
     *
     * @param inventoryLotDTO the inventoryLotDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new inventoryLotDTO, or with status {@code 400 (Bad Request)} if the inventoryLot has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<InventoryLotDTO> createInventoryLot(@Valid @RequestBody InventoryLotDTO inventoryLotDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save InventoryLot : {}", inventoryLotDTO);
        if (inventoryLotDTO.getId() != null) {
            throw new BadRequestAlertException("A new inventoryLot cannot already have an ID", ENTITY_NAME, "idexists");
        }
        inventoryLotDTO = inventoryLotService.save(inventoryLotDTO);
        return ResponseEntity.created(new URI("/api/inventory-lots/" + inventoryLotDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, inventoryLotDTO.getId().toString()))
            .body(inventoryLotDTO);
    }

    /**
     * {@code PUT  /inventory-lots/:id} : Updates an existing inventoryLot.
     *
     * @param id the id of the inventoryLotDTO to save.
     * @param inventoryLotDTO the inventoryLotDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated inventoryLotDTO,
     * or with status {@code 400 (Bad Request)} if the inventoryLotDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the inventoryLotDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<InventoryLotDTO> updateInventoryLot(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody InventoryLotDTO inventoryLotDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update InventoryLot : {}, {}", id, inventoryLotDTO);
        if (inventoryLotDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, inventoryLotDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!inventoryLotRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        inventoryLotDTO = inventoryLotService.update(inventoryLotDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, inventoryLotDTO.getId().toString()))
            .body(inventoryLotDTO);
    }

    /**
     * {@code PATCH  /inventory-lots/:id} : Partial updates given fields of an existing inventoryLot, field will ignore if it is null
     *
     * @param id the id of the inventoryLotDTO to save.
     * @param inventoryLotDTO the inventoryLotDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated inventoryLotDTO,
     * or with status {@code 400 (Bad Request)} if the inventoryLotDTO is not valid,
     * or with status {@code 404 (Not Found)} if the inventoryLotDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the inventoryLotDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<InventoryLotDTO> partialUpdateInventoryLot(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody InventoryLotDTO inventoryLotDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update InventoryLot partially : {}, {}", id, inventoryLotDTO);
        if (inventoryLotDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, inventoryLotDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!inventoryLotRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<InventoryLotDTO> result = inventoryLotService.partialUpdate(inventoryLotDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, inventoryLotDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /inventory-lots} : get all the Inventory Lots.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Inventory Lots in body.
     */
    @GetMapping("")
    public ResponseEntity<List<InventoryLotDTO>> getAllInventoryLots(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of InventoryLots");
        Page<InventoryLotDTO> page = inventoryLotService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /inventory-lots/:id} : get the "id" inventoryLot.
     *
     * @param id the id of the inventoryLotDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the inventoryLotDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<InventoryLotDTO> getInventoryLot(@PathVariable("id") Long id) {
        LOG.debug("REST request to get InventoryLot : {}", id);
        Optional<InventoryLotDTO> inventoryLotDTO = inventoryLotService.findOne(id);
        return ResponseUtil.wrapOrNotFound(inventoryLotDTO);
    }

    /**
     * {@code DELETE  /inventory-lots/:id} : delete the "id" inventoryLot.
     *
     * @param id the id of the inventoryLotDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventoryLot(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete InventoryLot : {}", id);
        inventoryLotService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
