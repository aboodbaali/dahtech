package com.dahtech.repository;

import com.dahtech.entity.Order;
import com.dahtech.entity.Order.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByOrderStatus(OrderStatus status, Pageable pageable);
    long countByOrderStatus(OrderStatus status);
    Page<Order> findByOrderByCreatedAtDesc(Pageable pageable);
}
