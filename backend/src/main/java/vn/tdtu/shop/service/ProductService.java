package vn.tdtu.shop.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import vn.tdtu.shop.domain.Brand;
import vn.tdtu.shop.domain.Category;
import vn.tdtu.shop.domain.Image;
import vn.tdtu.shop.domain.Product;
import vn.tdtu.shop.repository.*;
import vn.tdtu.shop.util.request.ProductDTO;
import vn.tdtu.shop.util.request.ProductRequestDTO;

@Service
@RequiredArgsConstructor
public class ProductService {

	@Autowired
    private final CartItemRepository cartItemRepository;
	@Autowired
    private final ProductRepository productRepository;
	@Autowired
    private final OrderItemRepository orderItemRepository;
	@Autowired
    private final BrandRepository brandRepository;
	@Autowired
    private final CategoryRepository categoryRepository;
	@Autowired
    private final ImageRepository imageRepository;



    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
        return convertToDTO(product);
    }

    public ProductDTO createProduct(ProductRequestDTO dto) {
        Product product = new Product();
        
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setViews(0L);
        product.setSoldQuantity(0L);

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new EntityNotFoundException("Thương hiệu không tồn tại với ID: " + dto.getBrandId()));
        product.setBrand(brand);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + dto.getCategoryId()));
        product.setCategory(category);

        product.setShortDescription(dto.getShortDescription());
        product.setDetailedDescription(dto.getDetailedDescription());

        // Tạo danh sách images
        List<Image> images = new ArrayList<>();
        for (String url : dto.getImages()) {
            Image image = new Image();
            image.setUrl(url);
            image.setProduct(product);
            images.add(image);
        }
        product.setImages(images);

        // Lưu product (tự động lưu images nhờ cascade)
        Product savedProduct = productRepository.save(product);

        return convertToDTO(savedProduct);
    }

    private void mapToEntityForCreate(ProductRequestDTO dto, Product product) {
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setViews(0L);
        product.setSoldQuantity(0L);

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Thương hiệu không tồn tại với ID: " + dto.getBrandId()));
        product.setBrand(brand);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + dto.getCategoryId()));
        product.setCategory(category);

        product.setShortDescription(dto.getShortDescription());
        product.setDetailedDescription(dto.getDetailedDescription());

        product.getImages().clear();
        product.getImages().addAll(dto.getImages().stream()
                .map(url -> {
                    Image image = new Image();
                    image.setUrl(url);
                    image.setProduct(product);
                    return image;
                }).collect(Collectors.toList()));
    }

    public ProductDTO updateProduct(Long id, ProductRequestDTO productRequestDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id));
        mapToEntity(productRequestDTO, product);
        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Sản phẩm không tồn tại với ID: " + id);
        }
        this.cartItemRepository.deleteByProductId(id);
        this.orderItemRepository.deleteByProductId(id);
        this.productRepository.deleteById(id);
    }

    public Page<ProductDTO> searchProducts(Long categoryId, Long brandId, String name, BigDecimal minPrice,
            BigDecimal maxPrice, Pageable pageable) {
        return productRepository.findByMultipleCriteria(categoryId, brandId, name, minPrice, maxPrice, pageable)
                .map(this::convertToDTO);
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setBrand(product.getBrand().getName()); // Trả về tên thương hiệu
        dto.setCategory(product.getCategory().getName()); // Trả về tên danh mục
        dto.setViews(product.getViews());
        dto.setSoldQuantity(product.getSoldQuantity());
        dto.setShortDescription(product.getShortDescription());
        dto.setDetailedDescription(product.getDetailedDescription());
        dto.setImages(product.getImages().stream().map(Image::getUrl).collect(Collectors.toList()));
        return dto;
    }

    private void mapToEntity(ProductRequestDTO dto, Product product) {
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Thương hiệu không tồn tại với ID: " + dto.getBrandId()));
        // System.out.println(">>> Brand retrieved: " + brand); // Thêm log
        product.setBrand(brand);

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Danh mục không tồn tại với ID: " + dto.getCategoryId()));
        product.setCategory(category);

        product.setShortDescription(dto.getShortDescription());
        product.setDetailedDescription(dto.getDetailedDescription());
        product.setSoldQuantity(product.getSoldQuantity() != null ? product.getSoldQuantity() : 0L);
        product.setViews(product.getViews() != null ? product.getViews() : 0L);
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