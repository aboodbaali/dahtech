package com.dahtech.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Order entity — created when a customer purchases a product online.
 * The admin sees this and dispatches a driver to the partner shop.
 */
@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotBlank
    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @NotBlank
    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @NotBlank
    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @NotBlank
    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    /** City for delivery routing */
    @Column(length = 100)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 30)
    @Builder.Default
    private OrderStatus orderStatus = OrderStatus.PENDING;

    /** Optional notes from the customer */
    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Enum ──────────────────────────────────────────────────────────────────

    public enum OrderStatus {
        /** Order placed, awaiting admin action */
        PENDING,
        /** Admin confirmed, driver dispatched to partner shop */
        DRIVER_DISPATCHED,
        /** Driver picked up item from shop */
        PICKED_UP,
        /** Item out for delivery to customer */
        OUT_FOR_DELIVERY,
        /** Successfully delivered */
        DELIVERED,
        /** Order was cancelled (item no longer available, etc.) */
        CANCELLED
    }
}
