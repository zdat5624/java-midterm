package vn.tdtu.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.tdtu.shop.domain.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}