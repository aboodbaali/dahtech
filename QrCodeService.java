package com.dahtech.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.EnumMap;
import java.util.Map;
import java.util.UUID;

/**
 * QR Code Service — generates unique QR codes for every product.
 *
 * ════════════════════════════════════════════════════════════
 * HOW THE QR CODE SYSTEM WORKS:
 * ════════════════════════════════════════════════════════════
 *
 * 1. When admin adds a product, this service generates:
 *    - A unique qrCodeHash (UUID, 128-bit random)
 *    - A QR code image encoding the URL:
 *      https://dahtech.com/api/products/quick-delete/{qrCodeHash}
 *
 * 2. Admin prints this QR code and gives it to the partner shop
 *    (attached to the physical item, or stored at the register).
 *
 * 3. When a walk-in customer buys the item, the cashier scans
 *    the QR code with their smartphone camera.
 *
 * 4. The phone browser opens the URL. Our API immediately:
 *    - Sets product.status = SOLD_LOCALLY
 *    - Returns a mobile-friendly confirmation page
 *
 * 5. The item disappears from the storefront in real time.
 *    If an online order existed for this item, the admin is
 *    alerted to contact the customer.
 *
 * ════════════════════════════════════════════════════════════
 * SECURITY:
 * - The qrCodeHash is a random UUID (not the sequential DB id).
 * - Even if someone guesses the endpoint, they can't enumerate
 *   product hashes — each is 128 bits of entropy.
 * - The endpoint is intentionally unauthenticated (no JWT)
 *   because the shop cashier is not a registered user.
 * ════════════════════════════════════════════════════════════
 */
@Service
public class QrCodeService {

    private static final Logger log = LoggerFactory.getLogger(QrCodeService.class);

    private static final int QR_WIDTH  = 300; // pixels
    private static final int QR_HEIGHT = 300; // pixels

    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Generates a fresh, unique QR code hash for a new product.
     * This is stored in the DB and embedded in the QR code URL.
     *
     * @return A URL-safe UUID string (e.g. "550e8400-e29b-41d4-a716-446655440000")
     */
    public String generateQrCodeHash() {
        return UUID.randomUUID().toString();
    }

    /**
     * Builds the full quick-delete URL that the QR code will encode.
     *
     * @param qrCodeHash the product's unique hash
     * @return full URL, e.g. "https://dahtech.com/api/products/quick-delete/550e8400-..."
     */
    public String buildQrCodeUrl(String qrCodeHash) {
        return baseUrl + "/api/products/quick-delete/" + qrCodeHash;
    }

    /**
     * Generates a QR code PNG image and returns it as a Base64-encoded string.
     * This is stored / returned so the admin can display and download it.
     *
     * @param qrCodeHash the product's unique hash
     * @return Base64-encoded PNG image string (can be used directly in <img src="data:image/png;base64,...">)
     */
    public String generateQrCodeBase64(String qrCodeHash) {
        String url = buildQrCodeUrl(qrCodeHash);
        try {
            byte[] pngBytes = generateQrCodePng(url);
            return Base64.getEncoder().encodeToString(pngBytes);
        } catch (WriterException | IOException e) {
            log.error("Failed to generate QR code for hash {}: {}", qrCodeHash, e.getMessage());
            throw new RuntimeException("QR code generation failed", e);
        }
    }

    /**
     * Generates a QR code PNG image and returns the raw bytes.
     * Used when the admin wants to download the QR code as a file.
     *
     * @param qrCodeHash the product's unique hash
     * @return raw PNG bytes
     */
    public byte[] generateQrCodeBytes(String qrCodeHash) {
        String url = buildQrCodeUrl(qrCodeHash);
        try {
            return generateQrCodePng(url);
        } catch (WriterException | IOException e) {
            log.error("Failed to generate QR code bytes for hash {}: {}", qrCodeHash, e.getMessage());
            throw new RuntimeException("QR code generation failed", e);
        }
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private byte[] generateQrCodePng(String content) throws WriterException, IOException {
        QRCodeWriter writer = new QRCodeWriter();

        // Configure QR code hints for maximum compatibility
        Map<EncodeHintType, Object> hints = new EnumMap<>(EncodeHintType.class);
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H); // High error correction (30%)
        hints.put(EncodeHintType.MARGIN, 2);                                 // Quiet zone margin
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, QR_WIDTH, QR_HEIGHT, hints);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }
}
