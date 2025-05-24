package vn.tdtu.shop.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.tdtu.shop.domain.Brand;
import vn.tdtu.shop.domain.Product;
import vn.tdtu.shop.repository.BrandRepository;
import vn.tdtu.shop.repository.ProductRepository;
import vn.tdtu.shop.util.request.BrandDTO;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductService productService;
    private final ProductRepository productRepository;

    public BrandDTO createBrand(BrandDTO brandDTO) {
        if (brandRepository.existsByName(brandDTO.getName())) {
            throw new IllegalArgumentException("Thương hiệu tên '" + brandDTO.getName() + "' đã tồn tại!");
        }
        Brand brand = new Brand();
        brand.setName(brandDTO.getName());
        brand = brandRepository.save(brand);
        return mapToDTO(brand);
    }

    public BrandDTO getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        return mapToDTO(brand);
    }

    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Page<BrandDTO> getAllBrandsPaged(Pageable pageable) {
        return brandRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    public BrandDTO updateBrand(Long id, BrandDTO brandDTO) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        if (!brand.getName().equals(brandDTO.getName()) && brandRepository.existsByName(brandDTO.getName())) {
            throw new IllegalArgumentException("Brand with name " + brandDTO.getName() + " already exists");
        }
        brand.setName(brandDTO.getName());
        brand = brandRepository.save(brand);
        return mapToDTO(brand);
    }

    @Transactional
    public void deleteBrand(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new EntityNotFoundException("Không tìm thấy thương hiệu với id: " + id);
        }

        List<Product> products = productRepository.findByBrandId(id);
        // Xóa từng Product và các CartItem, OrderItem liên quan
        for (Product product : products) {
            productService.deleteProduct(product.getId());
        }
        brandRepository.deleteById(id);
    }



    private BrandDTO mapToDTO(Brand brand) {
        BrandDTO brandDTO = new BrandDTO();
        brandDTO.setId(brand.getId());
        brandDTO.setName(brand.getName());
        return brandDTO;
    }
}