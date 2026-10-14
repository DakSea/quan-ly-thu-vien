package com.thunga.web.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.thunga.web.entity.Category;
import com.thunga.web.entity.Order;
import com.thunga.web.repository.OrderRepository;

@Service
public class OrderService {
	@Autowired OrderRepository orderRepository;
	
	public List<Order> findAll(){
		return orderRepository.findAll();
	}
	
	public Order findById(Integer id) {
		return orderRepository.findById(id).get();
	}
	
	public Order save(Order order) {
		return orderRepository.save(order);
	}
	
	public void delete(Order order) {
		orderRepository.delete(order);
	}
	
	public Page<Order> findByLimit(Integer page, Integer limit, String sortBy){
		Pageable paging = PageRequest.of(page, limit);
		if(sortBy != null) paging = PageRequest.of(page, limit, Sort.by(sortBy));
		Page<Order> orders = orderRepository.findAll(paging);
		return orders;
	}
}
