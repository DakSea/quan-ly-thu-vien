package com.thunga.web.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thunga.web.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
	Category findByName(String name);
}

