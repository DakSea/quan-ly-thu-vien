package com.thunga.web.validator;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.thunga.web.entity.Book;
import com.thunga.web.service.BookService;

@Component
public class BookValidator {
	
	@Autowired private BookService bookService;
	
	public boolean validate(Book book) {
		List<Book> oldBookList = bookService.findByTitle(book.getTitle());
		if(oldBookList != null) {
			for(Book oldBook: oldBookList) {
				if(book.getAuthor() != null && oldBook.getAuthor().equals(book.getAuthor())) return false;
			}
		}
		return true;
	}
}
