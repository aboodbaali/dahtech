package com.dahtech.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Shop entity — a physical partner shop that supplies inventory.
 * Products are linked to shops; we never hold stock ourselves.
 */
@Entity
@Table(name = "shops")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "shop_name", nullable = false, length = 100)
    private String shopName;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String location;

    /** Phone number, email, or any contact info */
    @Column(name = "contact_info", length = 200)
    private String contactInfo;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /** One shop can supply many products */
    @OneToMany(mappedBy = "shop", fetch = FetchType.LAZY)
    private List<Product> products;
}
