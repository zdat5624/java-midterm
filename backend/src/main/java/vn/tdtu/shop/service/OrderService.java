package vn.tdtu.shop.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.tdtu.shop.domain.*;
import vn.tdtu.shop.repository.*;
import vn.tdtu.shop.service.specification.OrderSpecification;
import vn.tdtu.shop.util.constant.OrderStatus;
import vn.tdtu.shop.util.error.ResourceNotFoundException;
import vn.tdtu.shop.util.request.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng không tồn tại"));

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Giỏ hàng rỗng, không thể tạo đơn hàng");
        }

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setReceiverName(request.getReceiverName());
        order.setStatus(OrderStatus.PENDING);

        cart.getItems().forEach(cartItem -> {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            order.getItems().add(orderItem);
        });

        order.setTotalAmount(calculateTotalAmount(order));

        // Lưu Order
        Order savedOrder = orderRepository.save(order);

        // Cập nhật soldQuantity cho từng Product
        for (OrderItem orderItem : order.getItems()) {
            Product product = orderItem.getProduct();
            product.setSoldQuantity(product.getSoldQuantity() + orderItem.getQuantity());
            productRepository.save(product);
        }

        // Xóa tất cả CartItem trong giỏ hàng
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();
        cartRepository.save(cart);

        return mapToOrderDTO(savedOrder);
    }
    
    public Page<OrderDTO> getUserOrders(Pageable pageable, OrderStatus status) {
        User user = getCurrentUser();
        Specification<Order> spec = Specification.where(OrderSpecification.hasUserId(user.getId()));
        if (status != null) {
            spec = spec.and(OrderSpecification.hasStatus(status));
        }
        return orderRepository.findAll(spec, pageable)
                .map(this::mapToOrderDTO);
    }

    public OrderDTO getOrderById(Long orderId) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .filter(o -> o.getUser().getId().equals(user.getId()) || hasAdminRole())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Đơn hàng không tồn tại hoặc bạn không có quyền truy cập"));
        return mapToOrderDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại"));

        order.setStatus(request.getStatus());
        Order updatedOrder = orderRepository.save(order);
        return mapToOrderDTO(updatedOrder);
    }

    @Transactional
    public OrderDTO cancelOrder(Long orderId) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .filter(o -> o.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại hoặc bạn không có quyền hủy"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể hủy đơn hàng ở trạng thái đang chờ xác nhận");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order updatedOrder = orderRepository.save(order);
        return mapToOrderDTO(updatedOrder);
    }

    public Page<OrderDTO> getAllOrders(Pageable pageable, OrderStatus status, Instant startDate, Instant endDate,
            String search) {
        return orderRepository.findAll(
                OrderSpecification.filterOrders(status, startDate, endDate, search),
                pageable).map(this::mapToOrderDTO);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
    }

    private boolean hasAdminRole() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }

    private OrderDTO mapToOrderDTO(Order order) {
        OrderDTO orderDTO = new OrderDTO();
        orderDTO.setId(order.getId());
        orderDTO.setUserId(order.getUser().getId());
        orderDTO.setOrderDate(order.getOrderDate());
        orderDTO.setStatus(order.getStatus());
        orderDTO.setShippingAddress(order.getShippingAddress());
        orderDTO.setReceiverPhone(order.getReceiverPhone());
        orderDTO.setReceiverName(order.getReceiverName());
        orderDTO.setItems(order.getItems().stream()
                .map(this::mapToOrderItemDTO)
                .collect(Collectors.toList()));
        orderDTO.setTotalAmount(order.getTotalAmount());
        return orderDTO;
    }

    private OrderItemDTO mapToOrderItemDTO(OrderItem orderItem) {
        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setId(orderItem.getId());
        itemDTO.setProductId(orderItem.getProduct().getId());
        itemDTO.setProductName(orderItem.getProduct().getName());
        itemDTO.setPrice(orderItem.getPrice());
        itemDTO.setQuantity(orderItem.getQuantity());
        itemDTO.setProductImage(orderItem.getProduct().getImages().isEmpty()
                ? null
                : orderItem.getProduct().getImages().get(0).getUrl());
        return itemDTO;
    }

    private BigDecimal calculateTotalAmount(Order order) {
        return order.getItems().stream()
                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}