package com.dahtech.service;

import com.dahtech.dto.OrderCreateRequest;
import com.dahtech.dto.OrderResponse;
import com.dahtech.entity.Order;
import com.dahtech.entity.Product;
import com.dahtech.entity.Product.ProductStatus;
import com.dahtech.repository.OrderRepository;
import com.dahtech.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    /**
     * Customer places an order from the storefront.
     * Immediately marks the product as SOLD_ONLINE so it's removed from the storefront.
     */
    public OrderResponse createOrder(OrderCreateRequest request) {
        Product product = productRepository.findById(request.productId())
            .orElseThrow(() -> new RuntimeException("Product not found: " + request.productId()));

        if (product.getStatus() != ProductStatus.AVAILABLE) {
            throw new RuntimeException(
                "Product is no longer available. Status: " + product.getStatus()
            );
        }

        // Lock the product immediately
        product.setStatus(ProductStatus.SOLD_ONLINE);
        productRepository.save(product);

        Order order = Order.builder()
            .product(product)
            .customerName(request.customerName())
            .customerPhone(request.customerPhone())
            .customerEmail(request.customerEmail())
            .shippingAddress(request.shippingAddress())
            .city(request.city())
            .notes(request.notes())
            .orderStatus(Order.OrderStatus.PENDING)
            .build();

        Order saved = orderRepository.save(order);
        log.info("Order placed: id={}, product={}, customer={}",
            saved.getId(), product.getName(), request.customerName());

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByStatus(Order.OrderStatus status, Pageable pageable) {
        return orderRepository.findByOrderStatus(status, pageable).map(this::toResponse);
    }

    public OrderResponse updateOrderStatus(Long orderId, Order.OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setOrderStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    private OrderResponse toResponse(Order o) {
        Product p = o.getProduct();
        return new OrderResponse(
            o.getId(), p.getId(), p.getName(), p.getCategory(), p.getPrice(),
            p.getShop().getShopName(), p.getShop().getLocation(), p.getShop().getContactInfo(),
            o.getCustomerName(), o.getCustomerPhone(), o.getCustomerEmail(),
            o.getShippingAddress(), o.getCity(), o.getOrderStatus(),
            o.getNotes(), o.getCreatedAt()
        );
    }
}
