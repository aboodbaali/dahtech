package com.dahtech.service;

import com.dahtech.dto.ProductCreateRequest;
import com.dahtech.dto.ProductResponse;
import com.dahtech.entity.Product;
import com.dahtech.entity.Product.ProductStatus;
import com.dahtech.entity.Shop;
import com.dahtech.repository.ProductRepository;
import com.dahtech.repository.ShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Transactional
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;
    private final QrCodeService qrCodeService;

    public ProductService(
        ProductRepository productRepository,
        ShopRepository shopRepository,
        QrCodeService qrCodeService
    ) {
        this.productRepository = productRepository;
        this.shopRepository = shopRepository;
        this.qrCodeService = qrCodeService;
    }

    /**
     * Admin creates a new product listing.
     * Automatically generates a unique QR code hash.
     */
    public ProductResponse createProduct(ProductCreateRequest request) {
        Shop shop = shopRepository.findById(request.shopId())
            .orElseThrow(() -> new RuntimeException("Shop not found: " + request.shopId()));

        // Generate unique QR code hash for this product
        String qrHash = qrCodeService.generateQrCodeHash();

        Product product = Product.builder()
            .name(request.name())
            .category(request.category())
            .price(request.price())
            .condition(request.condition())
            .warrantyDetails(request.warrantyDetails())
            .warrantyDays(request.warrantyDays() != null ? request.warrantyDays() : 30)
            .description(request.description())
            .imageUrl(request.imageUrl())
            .qrCodeHash(qrHash)
            .status(ProductStatus.AVAILABLE)
            .shop(shop)
            .build();

        Product saved = productRepository.save(product);
        log.info("Product created: id={}, name={}, shop={}, qrHash={}",
            saved.getId(), saved.getName(), shop.getShopName(), qrHash);

        return toAdminResponse(saved);
    }

    /**
     * PUBLIC: Browse available products with optional filters.
     * QR code Base64 is NOT included in public responses.
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getPublicProducts(
            String category, BigDecimal minPrice, BigDecimal maxPrice,
            String search, Pageable pageable) {
        return productRepository
            .findAvailableWithFilters(category, minPrice, maxPrice, search, pageable)
            .map(this::toPublicResponse);
    }

    /**
     * ADMIN: Get all products (including sold) with QR codes.
     */
    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProductsForAdmin(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toAdminResponse);
    }

    /**
     * ADMIN: Get single product with QR code.
     */
    @Transactional(readOnly = true)
    public ProductResponse getProductForAdmin(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return toAdminResponse(product);
    }

    /**
     * Download QR code as PNG bytes for a product.
     */
    @Transactional(readOnly = true)
    public byte[] getQrCodeBytes(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        return qrCodeService.generateQrCodeBytes(product.getQrCodeHash());
    }

    /**
     * CRITICAL: Called when a shop cashier scans the QR code.
     *
     * This endpoint is PUBLIC (no JWT required) — the shop cashier
     * is not a registered user of the admin system.
     *
     * @param qrCodeHash the unique hash embedded in the QR code
     * @return the product name for the confirmation message
     */
    public String markAsSoldLocally(String qrCodeHash) {
        Product product = productRepository.findByQrCodeHash(qrCodeHash)
            .orElseThrow(() -> new RuntimeException("Product not found for QR hash"));

        // Only AVAILABLE products can be marked as sold locally
        if (product.getStatus() != ProductStatus.AVAILABLE) {
            log.warn("QR scan attempted on non-available product: id={}, status={}",
                product.getId(), product.getStatus());
            // Return the product name anyway — useful for cashier confirmation
            return product.getName() + " [ALREADY_SOLD]";
        }

        product.setStatus(ProductStatus.SOLD_LOCALLY);
        product.setSoldAt(LocalDateTime.now());
        productRepository.save(product);

        log.info("Product marked SOLD_LOCALLY via QR scan: id={}, name={}, shop={}",
            product.getId(), product.getName(), product.getShop().getShopName());

        return product.getName();
    }

    /** Admin dashboard stats */
    @Transactional(readOnly = true)
    public DashboardStats getDashboardStats() {
        return new DashboardStats(
            productRepository.countByStatus(ProductStatus.AVAILABLE),
            productRepository.countByStatus(ProductStatus.SOLD_ONLINE),
            productRepository.countByStatus(ProductStatus.SOLD_LOCALLY)
        );
    }

    public record DashboardStats(long available, long soldOnline, long soldLocally) {}

    // ── Mapping helpers ───────────────────────────────────────────────────────

    /** Full response with QR code — for admin only */
    private ProductResponse toAdminResponse(Product p) {
        String qrBase64 = qrCodeService.generateQrCodeBase64(p.getQrCodeHash());
        return mapProduct(p, qrBase64);
    }

    /** No QR code in public response */
    private ProductResponse toPublicResponse(Product p) {
        return mapProduct(p, null);
    }

    private ProductResponse mapProduct(Product p, String qrBase64) {
        return new ProductResponse(
            p.getId(), p.getName(), p.getCategory(), p.getPrice(),
            p.getCondition(), p.getWarrantyDetails(), p.getWarrantyDays(),
            p.getDescription(), p.getImageUrl(), p.getStatus(),
            p.getShop().getId(), p.getShop().getShopName(), p.getShop().getLocation(),
            qrBase64, p.getCreatedAt()
        );
    }
}
