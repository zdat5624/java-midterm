package vn.tdtu.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.tdtu.shop.service.OrderService;
import vn.tdtu.shop.util.constant.OrderStatus;
import vn.tdtu.shop.util.request.CreateOrderRequest;
import vn.tdtu.shop.util.request.OrderDTO;
import vn.tdtu.shop.util.request.OrderItemDTO;
import vn.tdtu.shop.util.request.UpdateOrderStatusRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    private OrderDTO orderDTO;
    private CreateOrderRequest createOrderRequest;
    private UpdateOrderStatusRequest updateOrderStatusRequest;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        orderDTO = new OrderDTO();
        orderDTO.setId(1L);
        orderDTO.setUserId(1L);
        orderDTO.setOrderDate(Instant.now());
        orderDTO.setStatus(OrderStatus.PENDING);
        orderDTO.setShippingAddress("123 Main St");
        orderDTO.setReceiverPhone("1234567890");
        orderDTO.setReceiverName("John Doe");
        orderDTO.setTotalAmount(new BigDecimal("100.00"));
        OrderItemDTO itemDTO = new OrderItemDTO(1L, 1L, "Product 1", "image.jpg", new BigDecimal("100.00"), 1);
        orderDTO.setItems(Collections.singletonList(itemDTO));

        createOrderRequest = new CreateOrderRequest();
        createOrderRequest.setShippingAddress("123 Main St");
        createOrderRequest.setReceiverPhone("1234567890");
        createOrderRequest.setReceiverName("John Doe");

        updateOrderStatusRequest = new UpdateOrderStatusRequest();
        updateOrderStatusRequest.setStatus(OrderStatus.CONFIRMED);

        pageable = PageRequest.of(0, 10);
    }

    @Test
    void createOrder_ShouldReturnCreatedOrder_WhenValidRequest() throws Exception {
        when(orderService.createOrder(any(CreateOrderRequest.class))).thenReturn(orderDTO);

        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createOrderRequest))
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1L))
                .andExpect(jsonPath("$.data.shippingAddress").value("123 Main St"))
                .andExpect(jsonPath("$.data.receiverName").value("John Doe"))
                .andExpect(jsonPath("$.data.totalAmount").value(100.00))
                .andExpect(jsonPath("$.statusCode").value(201));
    }

    @Test
    void getUserOrders_ShouldReturnPagedOrders_WhenCalled() throws Exception {
        Page<OrderDTO> orderPage = new PageImpl<>(Collections.singletonList(orderDTO), pageable, 1);
        when(orderService.getUserOrders(eq(pageable), eq(null))).thenReturn(orderPage);

        mockMvc.perform(get("/api/orders")
                .param("page", "0")
                .param("size", "10")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].id").value(1L))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    void getUserOrders_WithStatus_ShouldReturnFilteredOrders() throws Exception {
        Page<OrderDTO> orderPage = new PageImpl<>(Collections.singletonList(orderDTO), pageable, 1);
        when(orderService.getUserOrders(eq(pageable), eq(OrderStatus.PENDING))).thenReturn(orderPage);

        mockMvc.perform(get("/api/orders")
                .param("page", "0")
                .param("size", "10")
                .param("status", "PENDING")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].status").value("PENDING"))
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    void getOrderById_ShouldReturnOrder_WhenIdExists() throws Exception {
        when(orderService.getOrderById(1L)).thenReturn(orderDTO);

        mockMvc.perform(get("/api/orders/1")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1L))
                .andExpect(jsonPath("$.data.receiverName").value("John Doe"))
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    void updateOrderStatus_ShouldUpdateStatus_WhenValidRequest() throws Exception {
        orderDTO.setStatus(OrderStatus.CONFIRMED);
        when(orderService.updateOrderStatus(eq(1L), any(UpdateOrderStatusRequest.class))).thenReturn(orderDTO);

        mockMvc.perform(put("/api/orders/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateOrderStatusRequest))
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    void updateOrderStatus_ShouldReturnOk_WhenAdmin() throws Exception {
        mockMvc.perform(put("/api/orders/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateOrderStatusRequest))
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }

    @Test
    void cancelOrder_ShouldReturnCancelledOrder_WhenValid() throws Exception {
        orderDTO.setStatus(OrderStatus.CANCELLED);
        when(orderService.cancelOrder(1L)).thenReturn(orderDTO);

        mockMvc.perform(put("/api/orders/1/cancel")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    void getAllOrders_ShouldReturnPagedOrders_WhenCalled() throws Exception {
        Page<OrderDTO> orderPage = new PageImpl<>(Collections.singletonList(orderDTO), pageable, 1);
        when(orderService.getAllOrders(eq(pageable), eq(null), eq(null), eq(null), eq(null)))
                .thenReturn(orderPage);

        mockMvc.perform(get("/api/orders/all")
                .param("page", "0")
                .param("size", "10")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].id").value(1L))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    void getAllOrders_WithFilters_ShouldReturnFilteredOrders() throws Exception {
        Page<OrderDTO> orderPage = new PageImpl<>(Collections.singletonList(orderDTO), pageable, 1);
        Instant startDate = Instant.now().minusSeconds(3600);
        Instant endDate = Instant.now();
        when(orderService.getAllOrders(eq(pageable), eq(OrderStatus.PENDING), eq(startDate), eq(endDate), eq("John")))
                .thenReturn(orderPage);

        mockMvc.perform(get("/api/orders/all")
                .param("page", "0")
                .param("size", "10")
                .param("status", "PENDING")
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString())
                .param("search", "John")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].status").value("PENDING"))
                .andExpect(jsonPath("$.statusCode").value(200));
    }

    @Test
    void getAllOrders_ShouldReturnOk_WhenAdmin() throws Exception {
        mockMvc.perform(get("/api/orders/all")
                .param("page", "0")
                .param("size", "10")
                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk());
    }
}