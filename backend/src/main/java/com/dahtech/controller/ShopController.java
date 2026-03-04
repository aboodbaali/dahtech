package com.dahtech.controller;

import com.dahtech.entity.Shop;
import com.dahtech.repository.ShopRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shops")
public class ShopController {

    private final ShopRepository shopRepository;

    public ShopController(ShopRepository shopRepository) {
        this.shopRepository = shopRepository;
    }

    /** PUBLIC — list active shops (for storefront info) */
    @GetMapping("/public")
    public ResponseEntity<List<Shop>> getActiveShops() {
        return ResponseEntity.ok(shopRepository.findByIsActiveTrue());
    }

    /** ADMIN — list all shops for product creation dropdown */
    @GetMapping
    public ResponseEntity<List<Shop>> getAllShops() {
        return ResponseEntity.ok(shopRepository.findAll());
    }

    /** ADMIN — create partner shop */
    @PostMapping
    public ResponseEntity<Shop> createShop(@RequestBody Shop shop) {
        return ResponseEntity.status(201).body(shopRepository.save(shop));
    }

    /** ADMIN — update shop */
    @PutMapping("/{id}")
    public ResponseEntity<Shop> updateShop(@PathVariable Long id, @RequestBody Shop updated) {
        return shopRepository.findById(id).map(shop -> {
            shop.setShopName(updated.getShopName());
            shop.setLocation(updated.getLocation());
            shop.setContactInfo(updated.getContactInfo());
            return ResponseEntity.ok(shopRepository.save(shop));
        }).orElse(ResponseEntity.notFound().build());
    }
}
