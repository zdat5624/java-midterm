package vn.tdtu.shop.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.tdtu.shop.service.ProductService;
import vn.tdtu.shop.util.annotation.ApiMessage;
import vn.tdtu.shop.util.request.ProductDTO;
import vn.tdtu.shop.util.request.ProductRequestDTO;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

        private final ProductService productService;

        @ApiMessage("Lấy danh sách sản phẩm thành công")
        @GetMapping
        public ResponseEntity<Page<ProductDTO>> getAllProducts(Pageable pageable) {
                return ResponseEntity.ok(productService.getAllProducts(pageable));
        }

        @ApiMessage("Lấy thông tin chi tiết sản phẩm  thành công")
        @GetMapping("/{id}")
        public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
                return ResponseEntity.ok(productService.getProductById(id));
        }

        @ApiMessage("Tạo sản phẩm mới thành công")
        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductRequestDTO productRequestDTO) {
                return new ResponseEntity<>(productService.createProduct(productRequestDTO), HttpStatus.CREATED);
        }

        @ApiMessage("Cập nhật sản phẩm thành công")
        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ProductDTO> updateProduct(@PathVariable Long id,
                        @Valid @RequestBody ProductRequestDTO productRequestDTO) {
                return ResponseEntity.ok(productService.updateProduct(id, productRequestDTO));
        }

        @ApiMessage("Xóa sản phẩm thành công")
        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
                productService.deleteProduct(id);
                return ResponseEntity.noContent().build();
        }

        @ApiMessage("Lấy danh sách sản phẩm thành công")
        @GetMapping("/search")
        public ResponseEntity<Page<ProductDTO>> searchProducts(
                        @RequestParam(required = false) Long categoryId,
                        @RequestParam(required = false) Long brandId,
                        @RequestParam(required = false) String name,
                        @RequestParam(required = false) BigDecimal minPrice,
                        @RequestParam(required = false) BigDecimal maxPrice,
                        Pageable pageable) {
                return ResponseEntity
                                .ok(productService.searchProducts(categoryId, brandId, name, minPrice, maxPrice,
                                                pageable));
        }

        @ApiMessage("Lấy danh sách sản phẩm tương tự thành công")
        @GetMapping("/{id}/similar")
        public ResponseEntity<Page<ProductDTO>> getSimilarProducts(@PathVariable Long id, Pageable pageable) {
                return ResponseEntity.ok(productService.getSimilarProducts(id, pageable));
        }
}