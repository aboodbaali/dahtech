package com.dahtech.repository;

import com.dahtech.entity.Product;
import com.dahtech.entity.Product.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /** Used by the public storefront — only show AVAILABLE items */
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    /** Filter by category (case-insensitive) for storefront */
    Page<Product> findByStatusAndCategoryIgnoreCase(ProductStatus status, String category, Pageable pageable);

    /** CRITICAL: QR code lookup — used by the quick-delete endpoint */
    Optional<Product> findByQrCodeHash(String qrCodeHash);

    /** Admin dashboard stats */
    long countByStatus(ProductStatus status);

    /**
     * Full-text storefront search with optional filters.
     * JPQL query filters by status=AVAILABLE and applies optional category/price filters.
     */
    @Query("""
        SELECT p FROM Product p
        WHERE p.status = 'AVAILABLE'
          AND (:category IS NULL OR LOWER(p.category) = LOWER(:category))
          AND (:minPrice IS NULL OR p.price >= :minPrice)
          AND (:maxPrice IS NULL OR p.price <= :maxPrice)
          AND (:search IS NULL OR
               LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Product> findAvailableWithFilters(
        @Param("category") String category,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("search") String search,
        Pageable pageable
    );

    /** Admin: get all products for a specific shop */
    Page<Product> findByShopId(Long shopId, Pageable pageable);
}
