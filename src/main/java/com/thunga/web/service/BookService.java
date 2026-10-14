package com.thunga.web.service;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.thunga.web.entity.Author;
import com.thunga.web.entity.Book;
import com.thunga.web.entity.Category;
import com.thunga.web.repository.BookRepository;

import utils.Utils;

@Service
public class BookService {
	@Autowired private BookRepository bookRepository;
	
	@Autowired private AuthorService authorService;
	
	@Autowired private CategoryService categoryService;
	
	public List<Book> findAll(){
		return bookRepository.findAll();
	}

	public Book findById(Integer id) {
		return bookRepository.findById(id).get();
	}
	
	public List<Book> findByTitle(String title) {
		return bookRepository.findByTitle(title);
	}
	
	public void deleteById(Integer id) {
		bookRepository.deleteById(id);
	}
	
	public Page<Book> findByLimit(Integer page, Integer limit, String sortBy){
		Pageable paging = PageRequest.of(page, limit);
		if(sortBy != null) paging = PageRequest.of(page, limit, Sort.by(sortBy));
		Page<Book> books = bookRepository.findAll(paging);
		return books;	
	}
	
	public Book save(Book book) {
		return bookRepository.save(book);
	}
	
	public Book findBestSoldBook() {
		return bookRepository.findBestSoldBook();
	}
	
	public Book updateInfo(Book newBook, HttpServletRequest request) throws IOException {
		Book updateBook;
		byte [] image = newBook.getFileData().getBytes();
		Category category = categoryService.findByName(request.getParameter("categoryInfo"));
		Author author = authorService.findByName(request.getParameter("authorInfo"));
		if(newBook.getId() != null) {
			updateBook = bookRepository.findById(newBook.getId()).get();
			updateBook.setCategory(category);
			updateBook.setDescription(newBook.getDescription());
			updateBook.setDate_publication(newBook.getDate_publication());
			updateBook.setPrice(newBook.getPrice());
			updateBook.setUpdated_at(Utils.getCurrentDate());
		}
		else {
			updateBook = newBook;
			updateBook.setAuthor(author);
			updateBook.setCategory(category);
			updateBook.setCreated_at(Utils.getCurrentDate());
		}
		if(image.length > 0) updateBook.setImage(image);
		return bookRepository.save(updateBook);
	}
	
	public List<Book> search(String type, String keyword){
		if(!type.equals("category")) keyword = "%" + keyword + "%";
		Pageable paging = PageRequest.of(0, 12);
		List<Book> bookList = null;
		if(type.equals("title")) bookList = bookRepository.findBySimilarTitle(keyword, paging);
		if(type.equals("author")) {
			bookList = bookRepository.findBySimilarAuthor(keyword, paging);
		}
		if(type.equals("category")) {
			Category category = categoryService.findByName(keyword);
			bookList = bookRepository.findByCategory(category, paging);
		}
		return bookList;
	}
}
