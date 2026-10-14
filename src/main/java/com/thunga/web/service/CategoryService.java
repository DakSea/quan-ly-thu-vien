package com.thunga.web.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.thunga.web.entity.Category;
import com.thunga.web.repository.CategoryRepository;

@Service
public class CategoryService {
	@Autowired CategoryRepository categoryRepository;
	
	public List<Category> findAll(){
		return categoryRepository.findAll();
	}
	
	public Category findByName(String name) {
		return categoryRepository.findByName(name);
	}
	
	public Category findById(Integer id) {
		return categoryRepository.findById(id).get();
	}
	
	public Category save(Category category) {
		return categoryRepository.save(category);
	}
	
	public void delete(Category category) {
		categoryRepository.delete(category);
	}
	
	public Page<Category> findByLimit(Integer page, Integer limit, String sortBy){
		Pageable paging = PageRequest.of(page, limit);
		if(sortBy != null) paging = PageRequest.of(page, limit, Sort.by(sortBy));
		Page<Category> categories = categoryRepository.findAll(paging);
		return categories;
	}
}
