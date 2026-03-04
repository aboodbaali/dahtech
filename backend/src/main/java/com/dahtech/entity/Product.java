package com.dahtech.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Product entity — the core of the marketplace.
 *
 * Key design decisions:
 * - qrCodeHash: a secure UUID used in the QR scan URL. It is NOT the same
 *   as the product ID, preventing sequential enumeration attacks.
 * - status: drives what's shown on the storefront vs marked sold.
 * - warrantyDetails: free text describing the guarantee (e.g. "30-day return").
 */
@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_status", columnList = "status"),
    @Index(name = "idx_product_category", columnList = "category"),
    @Index(name = "idx_product_qr_hash", columnList = "qr_code_hash", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String name;

    /** e.g. GPU, CPU, RAM, SSD, HDD, Motherboard, PSU, Case, Cooling */
    @NotBlank
    @Column(nullable = false, length = 50)
    private String category;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /** e.g. Excellent, Good, Fair */
    @NotBlank
    @Column(nullable = false, length = 50)
    private String condition;

    /** Human-readable warranty text, e.g. "30-day replacement guarantee" */
    @Column(name = "warranty_details", length = 500)
    private String warrantyDetails;

    /** Warranty duration in days, used for filtering/display */
    @Column(name = "warranty_days")
    @Builder.Default
    private Integer warrantyDays = 30;

    /** Optional detailed description */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** URL or filename of the product image */
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /**
     * CRITICAL: Unique UUID used in the QR code URL.
     * Using a separate hash (not the primary key) prevents:
     * 1. Sequential enumeration (attacker can't guess other products)
     * 2. Brute-force deletion attacks
     */
    @Column(name = "qr_code_hash", nullable = false, unique = true, length = 64)
    private String qrCodeHash;

    /** Current availability status */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ProductStatus status = ProductStatus.AVAILABLE;

    /** The partner shop where this item physically lives */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private Shop shop;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** Timestamp of when the item was sold/removed */
    @Column(name = "sold_at")
    private LocalDateTime soldAt;

    // ── Enum ──────────────────────────────────────────────────────────────────

    public enum ProductStatus {
        /** Visible on storefront, ready to be ordered online */
        AVAILABLE,
        /** Customer placed an online order — driver en route to shop */
        SOLD_ONLINE,
        /**
         * Shop cashier scanned the QR code — walk-in customer bought it.
         * Item is immediately hidden from storefront.
         */
        SOLD_LOCALLY
    }
}
