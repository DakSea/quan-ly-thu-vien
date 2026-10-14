package com.thunga.web.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thunga.web.entity.Order;
import com.thunga.web.entity.User;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
	List<Order> findByUser (User user);
}

