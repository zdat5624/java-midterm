package vn.tdtu.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.tdtu.shop.config.CustomAuthenticationEntryPoint;
import vn.tdtu.shop.service.ProductService;
import vn.tdtu.shop.util.request.ProductDTO;
import vn.tdtu.shop.util.request.ProductRequestDTO;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
public class ProductControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private ProductService productService;

        @MockitoBean
        private CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        @WithMockUser(authorities = "ROLE_USER")
        public void testGetAllProducts_Success() throws Exception {
                ProductDTO productDTO = new ProductDTO();
                productDTO.setId(1L);
                productDTO.setName("Laptop");
                productDTO.setPrice(new BigDecimal("1000.00"));
                productDTO.setBrand("Apple");
                productDTO.setCategory("Electronics");

                Page<ProductDTO> productPage = new PageImpl<>(Arrays.asList(productDTO), PageRequest.of(0, 10), 1);
                when(productService.getAllProducts(any())).thenReturn(productPage);

                mockMvc.perform(get("/api/products")
                                .param("page", "0")
                                .param("size", "10")
                                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.content[0].id").value(1L))
                                .andExpect(jsonPath("$.data.content[0].name").value("Laptop"))
                                .andExpect(jsonPath("$.statusCode").value(200));
        }

        @Test
        @WithMockUser(authorities = "ROLE_USER")
        public void testGetProductById_Success() throws Exception {
                ProductDTO productDTO = new ProductDTO();
                productDTO.setId(1L);
                productDTO.setName("Laptop");
                productDTO.setPrice(new BigDecimal("1000.00"));
                productDTO.setBrand("Apple");
                productDTO.setCategory("Electronics");

                when(productService.getProductById(1L)).thenReturn(productDTO);

                mockMvc.perform(get("/api/products/1")
                                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.id").value(1L))
                                .andExpect(jsonPath("$.data.name").value("Laptop"))
                                .andExpect(jsonPath("$.statusCode").value(200));
        }

        @Test
        @WithMockUser(authorities = "ROLE_USER")
        public void testGetProductById_NotFound() throws Exception {
                when(productService.getProductById(1L)).thenThrow(new EntityNotFoundException("Product not found"));

                mockMvc.perform(get("/api/products/1")
                                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                                .andDo(print())
                                .andExpect(status().isNotFound());
        }

        @Test
        @WithMockUser(authorities = "ROLE_ADMIN")
        public void testCreateProduct_Success() throws Exception {
                ProductRequestDTO requestDTO = new ProductRequestDTO();
                requestDTO.setName("Laptop");
                requestDTO.setPrice(new BigDecimal("1000.00"));
                requestDTO.setBrandId(1L);
                requestDTO.setCategoryId(1L);
                requestDTO.setImages(Arrays.asList("image1.jpg"));

                ProductDTO productDTO = new ProductDTO();
                productDTO.setId(1L);
                productDTO.setName("Laptop");
                productDTO.setPrice(new BigDecimal("1000.00"));
                productDTO.setBrand("Apple");
                productDTO.setCategory("Electronics");
                productDTO.setImages(Arrays.asList("image1.jpg"));

                when(productService.createProduct(any(ProductRequestDTO.class))).thenReturn(productDTO);

                mockMvc.perform(post("/api/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(requestDTO))
                                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                                .andDo(print())
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.data.id").value(1L))
                                .andExpect(jsonPath("$.data.name").value("Laptop"))
                                .andExpect(jsonPath("$.statusCode").value(201));
        }

        @Test
        public void testCreateProduct_Unauthorized() throws Exception {
                ProductRequestDTO requestDTO = new ProductRequestDTO();
                requestDTO.setName("Laptop");
                requestDTO.setPrice(new BigDecimal("1000.00"));
                requestDTO.setBrandId(1L);
                requestDTO.setCategoryId(1L);

                mockMvc.perform(post("/api/products")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(requestDTO)))
                                .andDo(print())
                                .andExpect(status().isForbidden());
        }

        @Test
        @WithMockUser(authorities = "ROLE_ADMIN")
        public void testUpdateProduct_Success() throws Exception {
                ProductRequestDTO requestDTO = new ProductRequestDTO();
                requestDTO.setName("Updated Laptop");
                requestDTO.setPrice(new BigDecimal("1200.00"));
                requestDTO.setBrandId(1L);
                requestDTO.setCategoryId(1L);

                ProductDTO productDTO = new ProductDTO();
                productDTO.setId(1L);
                productDTO.setName("Updated Laptop");
                productDTO.setPrice(new BigDecimal("1200.00"));
                productDTO.setBrand("Apple");
                productDTO.setCategory("Electronics");

                when(productService.updateProduct(eq(1L), any(ProductRequestDTO.class))).thenReturn(productDTO);

                mockMvc.perform(put("/api/products/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(requestDTO))
                                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.id").value(1L))
                                .andExpect(jsonPath("$.data.name").value("Updated Laptop"))
                                .andExpect(jsonPath("$.statusCode").value(200));
        }

        @Test
        @WithMockUser(authorities = "ROLE_ADMIN")
        public void testDeleteProduct_Success() throws Exception {
                doNothing().when(productService).deleteProduct(1L);

                mockMvc.perform(delete("/api/products/1")
                                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                                .andDo(print())
                                .andExpect(status().isNoContent());
        }

        @Test
        @WithMockUser(authorities = "ROLE_USER")
        public void testSearchProducts_Success() throws Exception {
                ProductDTO productDTO = new ProductDTO();
                productDTO.setId(1L);
                productDTO.setName("Laptop");
                productDTO.setPrice(new BigDecimal("1000.00"));
                productDTO.setBrand("Apple");
                productDTO.setCategory("Electronics");

                Page<ProductDTO> productPage = new PageImpl<>(Arrays.asList(productDTO), PageRequest.of(0, 10), 1);
                when(productService.searchProducts(eq(1L), eq(1L), eq("Laptop"), eq(new BigDecimal("500")),
                                eq(new BigDecimal("1500")), any())).thenReturn(productPage);

                mockMvc.perform(get("/api/products/search")
                                .param("categoryId", "1")
                                .param("brandId", "1")
                                .param("name", "Laptop")
                                .param("minPrice", "500")
                                .param("maxPrice", "1500")
                                .param("page", "0")
                                .param("size", "10")
                                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.content[0].id").value(1L))
                                .andExpect(jsonPath("$.data.content[0].name").value("Laptop"))
                                .andExpect(jsonPath("$.statusCode").value(200));

        }

        @Test
        @WithMockUser(authorities = "ROLE_USER")
        public void testSearchProducts_NoResults() throws Exception {
                Page<ProductDTO> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
                when(productService.searchProducts(eq(1L), eq(1L), eq("NonExistent"), eq(new BigDecimal("500")),
                                eq(new BigDecimal("1500")), any())).thenReturn(emptyPage);

                mockMvc.perform(get("/api/products/search")
                                .param("categoryId", "1")
                                .param("brandId", "1")
                                .param("name", "NonExistent")
                                .param("minPrice", "500")
                                .param("maxPrice", "1500")
                                .param("page", "0")
                                .param("size", "10")
                                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.content").isEmpty())
                                .andExpect(jsonPath("$.statusCode").value(200));
        }

        @Test
        @WithMockUser(authorities = "ROLE_USER")
        public void testGetSimilarProducts_Success() throws Exception {
                ProductDTO productDTO = new ProductDTO();
                productDTO.setId(2L);
                productDTO.setName("Phone");
                productDTO.setPrice(new BigDecimal("500.00"));
                productDTO.setBrand("Apple");
                productDTO.setCategory("Electronics");

                Page<ProductDTO> productPage = new PageImpl<>(Arrays.asList(productDTO), PageRequest.of(0, 10), 1);
                when(productService.getSimilarProducts(eq(1L), any())).thenReturn(productPage);

                mockMvc.perform(get("/api/products/1/similar")
                                .param("page", "0")
                                .param("size", "10")
                                .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_USER"))))
                                .andDo(print())
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.content[0].id").value(2L))
                                .andExpect(jsonPath("$.data.content[0].name").value("Phone"))
                                .andExpect(jsonPath("$.statusCode").value(200));

        }
}