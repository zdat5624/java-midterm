package vn.tdtu.shop.util.request;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import vn.tdtu.shop.util.constant.OrderStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private Long userId;
    private Instant orderDate;
    private OrderStatus status;
    private String shippingAddress;
    private String receiverPhone;
    private List<OrderItemDTO> items = new ArrayList<>();
    private BigDecimal totalAmount;
}
