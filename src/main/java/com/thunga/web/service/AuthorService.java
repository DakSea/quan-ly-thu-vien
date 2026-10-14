package com.thunga.web.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.thunga.web.entity.Author;
import com.thunga.web.repository.AuthorRepository;

@Service
public class AuthorService {
	@Autowired AuthorRepository authorRepository;
	
	public List<Author> findAll(){
		return authorRepository.findAll();
	}
	
	public Author findById(Integer id) {
		return authorRepository.findById(id).get();
	}
	
	public Author findByName(String name) {
		return authorRepository.findByName(name);
	}
	
	public Author save(Author author) {
		return authorRepository.save(author);
	}
	
	public void delete(Author author) {
		authorRepository.delete(author);
	}
	public Page<Author> findByLimit(Integer page, Integer limit){
		Page<Author> authors = authorRepository.findAll(PageRequest.of(page, limit));
		return authors;
	}
}
