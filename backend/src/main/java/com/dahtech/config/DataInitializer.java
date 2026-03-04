package com.dahtech.config;

import com.dahtech.entity.Admin;
import com.dahtech.entity.Shop;
import com.dahtech.repository.AdminRepository;
import com.dahtech.repository.ShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the database on first startup:
 * - Creates default admin account
 * - Creates sample partner shops
 *
 * IMPORTANT: Change the default admin password immediately in production!
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final AdminRepository adminRepository;
    private final ShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
        AdminRepository adminRepository,
        ShopRepository shopRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.adminRepository = adminRepository;
        this.shopRepository = shopRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedAdmin();
        seedShops();
    }

    private void seedAdmin() {
        if (!adminRepository.existsByUsername("admin")) {
            Admin admin = Admin.builder()
                .username("admin")
                // ⚠️ CHANGE THIS PASSWORD IN PRODUCTION!
                .password(passwordEncoder.encode("DahTech@2024!"))
                .build();
            adminRepository.save(admin);
            log.warn("=== DEFAULT ADMIN CREATED === username: admin | password: DahTech@2024!");
            log.warn("=== CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION! ===");
        }
    }

    private void seedShops() {
        if (shopRepository.count() == 0) {
            shopRepository.save(Shop.builder()
                .shopName("Al-Taknia Tech Store")
                .location("Al Olaya District, Riyadh")
                .contactInfo("+966 50 123 4567")
                .isActive(true)
                .build());

            shopRepository.save(Shop.builder()
                .shopName("PC World Jeddah")
                .location("Al Hamra District, Jeddah")
                .contactInfo("+966 55 987 6543")
                .isActive(true)
                .build());

            shopRepository.save(Shop.builder()
                .shopName("Dammam Computer Hub")
                .location("Al-Khobar Street, Dammam")
                .contactInfo("+966 53 456 7890")
                .isActive(true)
                .build());

            log.info("Sample partner shops seeded.");
        }
    }
}
