package com.dahtech.controller;

import com.dahtech.dto.ProductCreateRequest;
import com.dahtech.dto.ProductResponse;
import com.dahtech.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

/**
 * Product Controller
 *
 * Public endpoints (no JWT):
 *   GET  /api/products/public          — storefront listing with filters
 *   GET  /api/products/quick-delete/{hash} — QR scan quick-delete
 *
 * Admin endpoints (JWT required):
 *   GET  /api/products                 — all products
 *   POST /api/products                 — create product
 *   GET  /api/products/{id}/qr         — download QR code PNG
 *   GET  /api/products/stats           — dashboard stats
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // ════════════════════════════════════════════════════════════
    // PUBLIC ENDPOINTS (no authentication)
    // ════════════════════════════════════════════════════════════

    /**
     * Storefront product listing with filtering and pagination.
     * Only returns AVAILABLE products.
     */
    @GetMapping("/public")
    public ResponseEntity<Page<ProductResponse>> getPublicProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
            ? Sort.by(sortBy).ascending()
            : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(
            productService.getPublicProducts(category, minPrice, maxPrice, search, pageable)
        );
    }

    // ════════════════════════════════════════════════════════════
    // QR CODE QUICK-DELETE ENDPOINT (public, but hash-protected)
    // ════════════════════════════════════════════════════════════

    /**
     * THE KEY ENDPOINT — called when a shop cashier scans the QR code.
     *
     * Flow:
     * 1. Cashier scans QR code with phone camera
     * 2. Phone opens: dahtech.com/api/products/quick-delete/{hash}
     * 3. This endpoint sets product status → SOLD_LOCALLY
     * 4. Returns a mobile-friendly HTML confirmation page
     *
     * Security: Protected by the UUID hash (128-bit entropy), not a JWT.
     * This is intentional — the cashier doesn't have a login.
     *
     * Returns HTML (not JSON) so the phone browser shows a real page.
     */
    @GetMapping(value = "/quick-delete/{qrCodeHash}", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> quickDeleteViaScan(@PathVariable String qrCodeHash) {
        try {
            String productName = productService.markAsSoldLocally(qrCodeHash);

            boolean alreadySold = productName.endsWith("[ALREADY_SOLD]");
            String cleanName = alreadySold
                ? productName.replace(" [ALREADY_SOLD]", "")
                : productName;

            String html = buildConfirmationPage(cleanName, alreadySold, true);
            return ResponseEntity.ok(html);

        } catch (Exception e) {
            String errorHtml = buildConfirmationPage("Unknown", false, false);
            return ResponseEntity.status(404).body(errorHtml);
        }
    }

    // ════════════════════════════════════════════════════════════
    // ADMIN ENDPOINTS (JWT required)
    // ════════════════════════════════════════════════════════════

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(productService.getAllProductsForAdmin(pageable));
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductCreateRequest request
    ) {
        return ResponseEntity.status(201).body(productService.createProduct(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductForAdmin(id));
    }

    /**
     * Downloads the QR code as a PNG file.
     * Admin can print this and hand to the shop partner.
     */
    @GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> downloadQrCode(@PathVariable Long id) {
        byte[] qrBytes = productService.getQrCodeBytes(id);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"dahtech-product-" + id + "-qr.png\"")
            .body(qrBytes);
    }

    @GetMapping("/stats")
    public ResponseEntity<ProductService.DashboardStats> getStats() {
        return ResponseEntity.ok(productService.getDashboardStats());
    }

    // ── QR Code Confirmation HTML Page ───────────────────────────────────────

    /**
     * Returns a mobile-optimized HTML page shown after QR scan.
     * No React needed here — this is a one-time confirmation.
     */
    private String buildConfirmationPage(String productName, boolean alreadySold, boolean success) {
        if (!success) {
            return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Dah Tech - Error</title>
                  <style>
                    * { margin:0; padding:0; box-sizing:border-box; }
                    body { font-family:-apple-system,BlinkMacSystemFont,sans-serif;
                           background:#0f172a; color:#fff; min-height:100vh;
                           display:flex; align-items:center; justify-content:center; padding:20px; }
                    .card { background:#1e293b; border-radius:16px; padding:32px;
                            text-align:center; max-width:360px; width:100%; }
                    .icon { font-size:64px; margin-bottom:16px; }
                    h1 { color:#ef4444; font-size:22px; margin-bottom:12px; }
                    p { color:#94a3b8; font-size:15px; line-height:1.5; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="icon">❌</div>
                    <h1>QR Code Not Found</h1>
                    <p>This QR code is invalid or the product no longer exists.<br>
                       Contact Dah Tech support.</p>
                  </div>
                </body>
                </html>
                """;
        }

        if (alreadySold) {
            return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Dah Tech - Already Sold</title>
                  <style>
                    * { margin:0; padding:0; box-sizing:border-box; }
                    body { font-family:-apple-system,BlinkMacSystemFont,sans-serif;
                           background:#0f172a; color:#fff; min-height:100vh;
                           display:flex; align-items:center; justify-content:center; padding:20px; }
                    .card { background:#1e293b; border-radius:16px; padding:32px;
                            text-align:center; max-width:360px; width:100%; }
                    .icon { font-size:64px; margin-bottom:16px; }
                    h1 { color:#f59e0b; font-size:22px; margin-bottom:12px; }
                    p { color:#94a3b8; font-size:15px; line-height:1.5; }
                    .product { color:#fbbf24; font-weight:600; font-size:17px; margin:12px 0; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="icon">⚠️</div>
                    <h1>Already Sold</h1>
                    <div class="product">%s</div>
                    <p>This item was already marked as sold. No changes were made.</p>
                  </div>
                </body>
                </html>
                """.formatted(productName);
        }

        // SUCCESS case
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Dah Tech - Sold!</title>
              <style>
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:-apple-system,BlinkMacSystemFont,sans-serif;
                       background:#0f172a; color:#fff; min-height:100vh;
                       display:flex; align-items:center; justify-content:center; padding:20px; }
                .card { background:#1e293b; border-radius:16px; padding:40px 32px;
                        text-align:center; max-width:360px; width:100%;
                        animation: fadeUp 0.4s ease-out; }
                @keyframes fadeUp {
                  from { opacity:0; transform:translateY(20px); }
                  to   { opacity:1; transform:translateY(0); }
                }
                .icon { font-size:80px; margin-bottom:16px; }
                h1 { color:#22c55e; font-size:26px; font-weight:700; margin-bottom:8px; }
                .subtitle { color:#4ade80; font-size:14px; text-transform:uppercase;
                            letter-spacing:2px; margin-bottom:20px; }
                .product { background:#0f172a; border-radius:10px; padding:16px;
                           margin:16px 0; }
                .product-label { color:#64748b; font-size:12px; text-transform:uppercase;
                                  letter-spacing:1px; margin-bottom:6px; }
                .product-name { color:#f1f5f9; font-size:18px; font-weight:600; }
                p { color:#64748b; font-size:13px; line-height:1.6; margin-top:16px; }
                .logo { color:#3b82f6; font-weight:800; font-size:13px;
                        margin-top:24px; letter-spacing:1px; }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="icon">✅</div>
                <h1>Sold Locally!</h1>
                <p class="subtitle">Item removed from website</p>
                <div class="product">
                  <div class="product-label">Item</div>
                  <div class="product-name">%s</div>
                </div>
                <p>This item has been instantly removed from the Dah Tech storefront.
                   The online listing is no longer visible to customers.</p>
                <div class="logo">DAH TECH</div>
              </div>
            </body>
            </html>
            """.formatted(productName);
    }
}
