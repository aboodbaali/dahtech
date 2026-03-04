package com.dahtech.dto;

import com.dahtech.entity.Order.OrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Customer submits this to place an order */
public record OrderCreateRequest(
    @NotNull(message = "Product ID is required") Long productId,
    @NotBlank(message = "Your name is required") String customerName,
    @NotBlank(message = "Phone number is required") String customerPhone,
    String customerEmail,
    @NotBlank(message = "Shipping address is required") String shippingAddress,
    @NotBlank(message = "City is required") String city,
    String notes
) {}

/** Returned to admin when managing orders */
public record OrderResponse(
    Long id,
    Long productId,
    String productName,
    String productCategory,
    BigDecimal productPrice,
    String shopName,
    String shopLocation,
    String shopContact,
    String customerName,
    String customerPhone,
    String customerEmail,
    String shippingAddress,
    String city,
    OrderStatus orderStatus,
    String notes,
    LocalDateTime createdAt
) {}
