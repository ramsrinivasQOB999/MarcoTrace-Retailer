package com.mercotrace.retailer.web.rest;

import com.mercotrace.retailer.repository.SkuRepository;
import com.mercotrace.retailer.service.SkuService;
import com.mercotrace.retailer.service.dto.SkuDTO;
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
 * REST controller for managing {@link com.mercotrace.retailer.domain.Sku}.
 */
@RestController
@RequestMapping("/api/skus")
@Tag(name = "SKUs", description = "Product / SKU definitions")
public class SkuResource {

    private static final Logger LOG = LoggerFactory.getLogger(SkuResource.class);

    private static final String ENTITY_NAME = "sku";

    @Value("${jhipster.clientApp.name:mercotraceRetailer}")
    private String applicationName;

    private final SkuService skuService;

    private final SkuRepository skuRepository;

    public SkuResource(SkuService skuService, SkuRepository skuRepository) {
        this.skuService = skuService;
        this.skuRepository = skuRepository;
    }

    /**
     * {@code POST  /skus} : Create a new sku.
     *
     * @param skuDTO the skuDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new skuDTO, or with status {@code 400 (Bad Request)} if the sku has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<SkuDTO> createSku(@Valid @RequestBody SkuDTO skuDTO) throws URISyntaxException {
        LOG.debug("REST request to save Sku : {}", skuDTO);
        if (skuDTO.getId() != null) {
            throw new BadRequestAlertException("A new sku cannot already have an ID", ENTITY_NAME, "idexists");
        }
        skuDTO = skuService.save(skuDTO);
        return ResponseEntity.created(new URI("/api/skus/" + skuDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, skuDTO.getId().toString()))
            .body(skuDTO);
    }

    /**
     * {@code PUT  /skus/:id} : Updates an existing sku.
     *
     * @param id the id of the skuDTO to save.
     * @param skuDTO the skuDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated skuDTO,
     * or with status {@code 400 (Bad Request)} if the skuDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the skuDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SkuDTO> updateSku(@PathVariable(value = "id", required = false) final Long id, @Valid @RequestBody SkuDTO skuDTO)
        throws URISyntaxException {
        LOG.debug("REST request to update Sku : {}, {}", id, skuDTO);
        if (skuDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, skuDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!skuRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        skuDTO = skuService.update(skuDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, skuDTO.getId().toString()))
            .body(skuDTO);
    }

    /**
     * {@code PATCH  /skus/:id} : Partial updates given fields of an existing sku, field will ignore if it is null
     *
     * @param id the id of the skuDTO to save.
     * @param skuDTO the skuDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated skuDTO,
     * or with status {@code 400 (Bad Request)} if the skuDTO is not valid,
     * or with status {@code 404 (Not Found)} if the skuDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the skuDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<SkuDTO> partialUpdateSku(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SkuDTO skuDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Sku partially : {}, {}", id, skuDTO);
        if (skuDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, skuDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!skuRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SkuDTO> result = skuService.partialUpdate(skuDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, skuDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /skus} : get all the Skus.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Skus in body.
     */
    @GetMapping("")
    public ResponseEntity<List<SkuDTO>> getAllSkus(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of Skus");
        Page<SkuDTO> page = skuService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /skus/:id} : get the "id" sku.
     *
     * @param id the id of the skuDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the skuDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SkuDTO> getSku(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Sku : {}", id);
        Optional<SkuDTO> skuDTO = skuService.findOne(id);
        return ResponseUtil.wrapOrNotFound(skuDTO);
    }

    /**
     * {@code DELETE  /skus/:id} : delete the "id" sku.
     *
     * @param id the id of the skuDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSku(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Sku : {}", id);
        skuService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
