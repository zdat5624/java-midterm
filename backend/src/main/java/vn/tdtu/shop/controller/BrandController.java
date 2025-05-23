package vn.tdtu.shop.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.tdtu.shop.service.BrandService;
import vn.tdtu.shop.util.annotation.ApiMessage;
import vn.tdtu.shop.util.request.BrandDTO;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @ApiMessage("Tạo thương hiệu thành công")
    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@Valid @RequestBody BrandDTO brandDTO) {
        BrandDTO createdBrand = brandService.createBrand(brandDTO);
        return new ResponseEntity<>(createdBrand, HttpStatus.CREATED);
    }

    @ApiMessage("Lấy thông tin chi tiết thương hiệu thành công")
    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable Long id) {
        BrandDTO brandDTO = brandService.getBrandById(id);
        return ResponseEntity.ok(brandDTO);
    }

    @ApiMessage("Lấy danh sách thương hiệu thành công")
    @GetMapping("/paged")
    public ResponseEntity<Page<BrandDTO>> getAllBrandsPaged(Pageable pageable) {
        Page<BrandDTO> brands = brandService.getAllBrandsPaged(pageable);
        return ResponseEntity.ok(brands);
    }

    @ApiMessage("Cập nhật thương hiệu thành công")
    @PutMapping("/{id}")
    public ResponseEntity<BrandDTO> updateBrand(@PathVariable Long id, @Valid @RequestBody BrandDTO brandDTO) {
        BrandDTO updatedBrand = brandService.updateBrand(id, brandDTO);
        return ResponseEntity.ok(updatedBrand);
    }

    @ApiMessage("Xóa thương hiệu thành công")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}