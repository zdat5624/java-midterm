package vn.tdtu.shop.service;

import java.math.BigDecimal;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import vn.tdtu.shop.domain.Image;
import vn.tdtu.shop.domain.Product;
import vn.tdtu.shop.repository.ProductRepository;
import vn.tdtu.shop.util.request.ProductDTO;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
        return convertToDTO(product);
    }

    public ProductDTO createProduct(ProductDTO productDTO) {
        Product product = new Product();
        mapToEntity(productDTO, product);
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
        mapToEntity(productDTO, product);
        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id);
        }
        productRepository.deleteById(id);
    }

    public Page<ProductDTO> searchProducts(String category, String brand, String name, BigDecimal minPrice,
            BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByMultipleCriteria(category, brand, name, minPrice, maxPrice, pageable)
                .map(this::convertToDTO);
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setBrand(product.getBrand());
        dto.setCategory(product.getCategory());
        dto.setViews(product.getViews());
        dto.setSoldQuantity(product.getSoldQuantity());
        dto.setShortDescription(product.getShortDescription());
        dto.setDetailedDescription(product.getDetailedDescription());
        dto.setImages(product.getImages().stream().map(Image::getUrl).collect(Collectors.toList()));
        return dto;
    }

    private void mapToEntity(ProductDTO dto, Product product) {
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setBrand(dto.getBrand());
        product.setCategory(dto.getCategory());
        product.setShortDescription(dto.getShortDescription());
        product.setDetailedDescription(dto.getDetailedDescription());
        product.setSoldQuantity(dto.getSoldQuantity() != null ? dto.getSoldQuantity() : 0L);
        product.setViews(dto.getViews() != null ? dto.getViews() : 0L);
        product.getImages().clear();
        product.getImages().addAll(dto.getImages().stream()
                .map(url -> {
                    Image image = new Image();
                    image.setUrl(url);
                    image.setProduct(product);
                    return image;
                }).collect(Collectors.toList()));
    }
}
