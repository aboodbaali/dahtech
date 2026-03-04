package com.dahtech.controller;

import com.dahtech.dto.OrderCreateRequest;
import com.dahtech.dto.OrderResponse;
import com.dahtech.entity.Order.OrderStatus;
import com.dahtech.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** PUBLIC — customer places an order from storefront */
    @PostMapping("/public")
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.status(201).body(orderService.createOrder(request));
    }

    /** ADMIN — view all orders */
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) OrderStatus status
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> result = status != null
            ? orderService.getOrdersByStatus(status, pageable)
            : orderService.getAllOrders(pageable);
        return ResponseEntity.ok(result);
    }

    /** ADMIN — update order status (e.g., dispatch driver) */
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
