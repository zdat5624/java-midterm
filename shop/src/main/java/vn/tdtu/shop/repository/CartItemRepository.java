package vn.tdtu.shop.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.tdtu.shop.domain.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);
}
