package vn.tdtu.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.tdtu.shop.domain.Brand;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    boolean existsByName(String name);
}