package vn.tdtu.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import vn.tdtu.shop.config.TestSecurityConfiguration;
import vn.tdtu.shop.service.CartService;
import vn.tdtu.shop.util.FormatRestResponse;
import vn.tdtu.shop.util.request.AddToCartRequest;
import vn.tdtu.shop.util.request.CartDTO;
import vn.tdtu.shop.util.request.UpdateCartItemRequest;
import vn.tdtu.shop.util.request.CartItemDTO;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
@Import({ TestSecurityConfiguration.class, FormatRestResponse.class })
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CartService cartService;

    @Autowired
    private ObjectMapper objectMapper;

    private CartDTO cartDTO;
    private AddToCartRequest addToCartRequest;
    private UpdateCartItemRequest updateCartItemRequest;

    @BeforeEach
    void setUp() {
        // Initialize CartDTO
        cartDTO = new CartDTO();
        cartDTO.setId(1L);
        cartDTO.setUserId(1L);
        cartDTO.setItems(new ArrayList<>());

        // Add sample CartItemDTO
        CartItemDTO item = new CartItemDTO();
        item.setId(1L);
        item.setProductId(1L);
        item.setProductName("Sample Product");
        item.setProductImage("sample-image.jpg");
        item.setProductPrice(new BigDecimal("99.99"));
        item.setQuantity(2);
        cartDTO.getItems().add(item);

        // Initialize AddToCartRequest
        addToCartRequest = new AddToCartRequest();
        addToCartRequest.setProductId(1L);
        addToCartRequest.setQuantity(1);

        // Initialize UpdateCartItemRequest
        updateCartItemRequest = new UpdateCartItemRequest();
        updateCartItemRequest.setQuantity(3);
    }

    @Test
    @WithMockUser(roles = { "USER" })
    void getCart_ShouldReturnCart_WhenUserIsAuthenticated() throws Exception {
        when(cartService.getCart()).thenReturn(cartDTO);

        mockMvc.perform(get("/api/cart")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(cartDTO.getId()))
                .andExpect(jsonPath("$.data.userId").value(cartDTO.getUserId()))
                .andExpect(jsonPath("$.data.items[0].id").value(cartDTO.getItems().get(0).getId()))
                .andExpect(jsonPath("$.data.items[0].productId").value(cartDTO.getItems().get(0).getProductId()))
                .andExpect(jsonPath("$.data.items[0].productName").value(cartDTO.getItems().get(0).getProductName()))
                .andExpect(jsonPath("$.data.items[0].productImage").value(cartDTO.getItems().get(0).getProductImage()))
                .andExpect(jsonPath("$.data.items[0].productPrice")
                        .value(cartDTO.getItems().get(0).getProductPrice().doubleValue()))
                .andExpect(jsonPath("$.data.items[0].quantity").value(cartDTO.getItems().get(0).getQuantity()));
    }

    @Test
    void getCart_ShouldReturnForbidden_WhenUserIsNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = { "USER" })
    void addToCart_ShouldReturnUpdatedCart_WhenRequestIsValid() throws Exception {
        when(cartService.addToCart(addToCartRequest)).thenReturn(cartDTO);

        mockMvc.perform(post("/api/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(addToCartRequest))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(cartDTO.getId()))
                .andExpect(jsonPath("$.data.userId").value(cartDTO.getUserId()))
                .andExpect(jsonPath("$.data.items[0].id").value(cartDTO.getItems().get(0).getId()))
                .andExpect(jsonPath("$.data.items[0].productName").value(cartDTO.getItems().get(0).getProductName()))
                .andExpect(jsonPath("$.data.items[0].productPrice")
                        .value(cartDTO.getItems().get(0).getProductPrice().doubleValue()));
    }

    @Test
    @WithMockUser(roles = { "USER" })
    void addToCart_ShouldReturnBadRequest_WhenQuantityIsInvalid() throws Exception {
        AddToCartRequest invalidRequest = new AddToCartRequest();
        invalidRequest.setProductId(1L);
        invalidRequest.setQuantity(0); // Invalid quantity

        mockMvc.perform(post("/api/cart/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest))
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Số lượng phải lớn hơn 0"));
    }

    @Test
    @WithMockUser(roles = { "USER" })
    void updateCartItem_ShouldReturnUpdatedCart_WhenRequestIsValid() throws Exception {
        when(cartService.updateCartItem(1L, updateCartItemRequest)).thenReturn(cartDTO);

        mockMvc.perform(put("/api/cart/items/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateCartItemRequest))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(cartDTO.getId()))
                .andExpect(jsonPath("$.data.userId").value(cartDTO.getUserId()))
                .andExpect(jsonPath("$.data.items[0].quantity").value(cartDTO.getItems().get(0).getQuantity()))
                .andExpect(jsonPath("$.data.items[0].productName").value(cartDTO.getItems().get(0).getProductName()));
    }

    @Test
    @WithMockUser(roles = { "USER" })
    void updateCartItem_ShouldReturnBadRequest_WhenQuantityIsInvalid() throws Exception {
        UpdateCartItemRequest invalidRequest = new UpdateCartItemRequest();
        invalidRequest.setQuantity(0); // Invalid quantity

        mockMvc.perform(put("/api/cart/items/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest))
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Số lượng phải lớn hơn 0"));
    }

    @Test
    @WithMockUser(roles = { "USER" })
    void removeCartItem_ShouldReturnUpdatedCart_WhenItemExists() throws Exception {
        when(cartService.removeCartItem(1L)).thenReturn(cartDTO);

        mockMvc.perform(delete("/api/cart/items/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(cartDTO.getId()))
                .andExpect(jsonPath("$.data.userId").value(cartDTO.getUserId()))
                .andExpect(jsonPath("$.data.items[0].id").value(cartDTO.getItems().get(0).getId()));
    }

    @Test
    void removeCartItem_ShouldReturnForbidden_WhenUserIsNotAuthenticated() throws Exception {
        mockMvc.perform(delete("/api/cart/items/1"))
                .andExpect(status().isForbidden());
    }
}