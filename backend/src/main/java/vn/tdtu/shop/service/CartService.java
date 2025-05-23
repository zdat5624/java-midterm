package vn.tdtu.shop.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import vn.tdtu.shop.domain.Cart;
import vn.tdtu.shop.domain.CartItem;
import vn.tdtu.shop.domain.Product;
import vn.tdtu.shop.domain.User;
import vn.tdtu.shop.repository.CartItemRepository;
import vn.tdtu.shop.repository.CartRepository;
import vn.tdtu.shop.repository.ProductRepository;
import vn.tdtu.shop.repository.UserRepository;
import vn.tdtu.shop.util.error.ResourceNotFoundException;
import vn.tdtu.shop.util.request.AddToCartRequest;
import vn.tdtu.shop.util.request.CartDTO;
import vn.tdtu.shop.util.request.CartItemDTO;
import vn.tdtu.shop.util.request.UpdateCartItemRequest;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

        private final CartRepository cartRepository;
        private final CartItemRepository cartItemRepository;
        private final UserRepository userRepository;
        private final ProductRepository productRepository;

        public CartDTO getCart() {
                User user = getCurrentUser();
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseGet(() -> createNewCart(user));
                return mapToCartDTO(cart);
        }

        @Transactional
        public CartDTO addToCart(AddToCartRequest request) {
                User user = getCurrentUser();
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseGet(() -> createNewCart(user));

                Product product = productRepository.findById(request.getProductId())
                                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

                CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                                .orElseGet(() -> {
                                        CartItem newItem = new CartItem();
                                        newItem.setCart(cart);
                                        newItem.setProduct(product);
                                        newItem.setQuantity(0);
                                        return newItem;
                                });

                cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
                cartItemRepository.save(cartItem);

                return mapToCartDTO(cart);
        }

        @Transactional
        public CartDTO updateCartItem(Long cartItemId, UpdateCartItemRequest request) {
                User user = getCurrentUser();
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng không tồn tại"));

                CartItem cartItem = cartItemRepository.findById(cartItemId)
                                .filter(item -> item.getCart().getId().equals(cart.getId()))
                                .orElseThrow(() -> new ResourceNotFoundException("Hàng không tồn tại trong giỏ"));

                cartItem.setQuantity(request.getQuantity());
                cartItemRepository.save(cartItem);

                return mapToCartDTO(cart);
        }

        @Transactional
        public CartDTO removeCartItem(Long cartItemId) {
                User user = getCurrentUser();
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng không tồn tại"));

                CartItem cartItem = cartItemRepository.findById(cartItemId)
                                .filter(item -> item.getCart().getId().equals(cart.getId()))
                                .orElseThrow(() -> new ResourceNotFoundException("Hàng không tồn tại trong giỏ"));

                cart.getItems().remove(cartItem);
                cartRepository.save(cart);

                return mapToCartDTO(cart);
        }

        @Transactional
        public CartDTO clearCart() {
                User user = getCurrentUser();
                Cart cart = cartRepository.findByUserId(user.getId())
                                .orElseThrow(() -> new ResourceNotFoundException("Giỏ hàng không tồn tại"));

                cart.getItems().clear();
                cartRepository.save(cart);

                return mapToCartDTO(cart);
        }

        private Cart createNewCart(User user) {
                Cart cart = new Cart();
                cart.setUser(user);
                return cartRepository.save(cart);
        }

        private User getCurrentUser() {
                String email = SecurityContextHolder.getContext().getAuthentication().getName();
                return userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại"));
        }

        private CartDTO mapToCartDTO(Cart cart) {
                CartDTO cartDTO = new CartDTO();
                cartDTO.setId(cart.getId());
                cartDTO.setUserId(cart.getUser().getId());
                cartDTO.setItems(cart.getItems().stream()
                                .map(this::mapToCartItemDTO)
                                .collect(Collectors.toList()));
                return cartDTO;
        }

        private CartItemDTO mapToCartItemDTO(CartItem cartItem) {
                CartItemDTO itemDTO = new CartItemDTO();
                itemDTO.setId(cartItem.getId());
                itemDTO.setProductId(cartItem.getProduct().getId());
                itemDTO.setProductName(cartItem.getProduct().getName());
                itemDTO.setProductPrice(cartItem.getProduct().getPrice());
                itemDTO.setProductImage(cartItem.getProduct().getImages().isEmpty()
                                ? null
                                : cartItem.getProduct().getImages().get(0).getUrl());
                itemDTO.setQuantity(cartItem.getQuantity());
                return itemDTO;
        }
}