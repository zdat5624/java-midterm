package vn.tdtu.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.tdtu.shop.domain.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
}