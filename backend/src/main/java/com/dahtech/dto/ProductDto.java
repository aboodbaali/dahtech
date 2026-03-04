package com.dahtech.dto;

import com.dahtech.entity.Product.ProductStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for creating a new product via Admin dashboard.
 */
public record ProductCreateRequest(
    @NotBlank(message = "Product name is required")
    String name,

    @NotBlank(message = "Category is required")
    String category,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be positive")
    BigDecimal price,

    @NotBlank(message = "Condition is required")
    String condition,

    String warrantyDetails,

    @Min(value = 0, message = "Warranty days cannot be negative")
    Integer warrantyDays,

    String description,

    String imageUrl,

    @NotNull(message = "Shop ID is required")
    Long shopId
) {}


/**
 * DTO returned to the public storefront and admin — never exposes the raw DB id for QR hash.
 */
public record ProductResponse(
    Long id,
    String name,
    String category,
    BigDecimal price,
    String condition,
    String warrantyDetails,
    Integer warrantyDays,
    String description,
    String imageUrl,
    ProductStatus status,
    Long shopId,
    String shopName,
    String shopLocation,
    /**
     * The QR code as a Base64-encoded PNG image string.
     * ONLY included in admin responses, never sent to public storefront.
     */
    String qrCodeBase64,
    LocalDateTime createdAt
) {}
