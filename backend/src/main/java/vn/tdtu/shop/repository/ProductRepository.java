package vn.tdtu.shop.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import vn.tdtu.shop.domain.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

        @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId")
        List<Product> findByCategoryId(Long categoryId);

        @Query("SELECT p FROM Product p WHERE p.brand.id = :brandId")
        List<Product> findByBrandId(Long brandId);

        Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

        @Query("SELECT p FROM Product p WHERE " +
                        "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                        "(:brandId IS NULL OR p.brand.id = :brandId) AND " +
                        "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
                        "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR p.price <= :maxPrice)")
        Page<Product> findByMultipleCriteria(
                        @Param("categoryId") Long categoryId,
                        @Param("brandId") Long brandId,
                        @Param("name") String name,
                        @Param("minPrice") BigDecimal minPrice,
                        @Param("maxPrice") BigDecimal maxPrice,
                        Pageable pageable);
        
        @Query("SELECT p FROM Product p WHERE p.id != :productId AND " +
                "p.category.id = :categoryId AND p.brand.id = :brandId " +
                "ORDER BY p.views DESC")
         Page<Product> findByCategoryAndBrand(
                 @Param("productId") Long productId,
                 @Param("categoryId") Long categoryId,
                 @Param("brandId") Long brandId,
                 Pageable pageable);

         @Query("SELECT p FROM Product p WHERE p.id != :productId AND " +
                "p.category.id = :categoryId AND p.brand.id != :brandId " +
                "ORDER BY p.views DESC")
         Page<Product> findByCategoryOnly(
                 @Param("productId") Long productId,
                 @Param("categoryId") Long categoryId,
                 @Param("brandId") Long brandId,
                 Pageable pageable);

         @Query("SELECT p FROM Product p WHERE p.id != :productId AND " +
                "p.brand.id = :brandId AND p.category.id != :categoryId " +
                "ORDER BY p.views DESC")
         Page<Product> findByBrandOnly(
                 @Param("productId") Long productId,
                 @Param("categoryId") Long categoryId,
                 @Param("brandId") Long brandId,
                 Pageable pageable);
         @Query("SELECT p FROM Product p WHERE p.id != :productId ORDER BY p.views DESC")
         Page<Product> findAllByIdNot(@Param("productId") Long productId, Pageable pageable);
}