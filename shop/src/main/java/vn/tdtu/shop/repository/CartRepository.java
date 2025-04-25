package vn.tdtu.shop.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.tdtu.shop.domain.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(Long userId);
}
