package vn.tdtu.shop.service.specification;

import org.springframework.data.jpa.domain.Specification;
import vn.tdtu.shop.domain.Order;
import vn.tdtu.shop.util.constant.OrderStatus;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {

    public static Specification<Order> filterOrders(OrderStatus status, Instant startDate, Instant endDate,
            String receiverPhone, String email) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("orderDate"), startDate));
            }

            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("orderDate"), endDate));
            }

            if (receiverPhone != null && !receiverPhone.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("receiverPhone")),
                        "%" + receiverPhone.toLowerCase() + "%"));
            }

            if (email != null && !email.isBlank()) {
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("email")),
                        "%" + email.toLowerCase() + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}