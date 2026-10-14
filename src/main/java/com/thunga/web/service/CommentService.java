package com.thunga.web.service;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.thunga.web.entity.Account;
import com.thunga.web.entity.Book;
import com.thunga.web.entity.Comment;
import com.thunga.web.entity.User;
import com.thunga.web.repository.CommentRepository;

import utils.Utils;

@Service
public class CommentService {
	@Autowired private CommentRepository commentRepository;
	
	@Autowired private BookService bookService;
	
	@Autowired private AccountService accountService;
	
	@Autowired private UserService userService;
	
	public Comment save(Comment comment, HttpServletRequest request) {
		Integer book_id = Integer.valueOf(request.getParameter("book_id"));
		String username = request.getParameter("username");
		Account account = accountService.findByUsername(username);
		User user = userService.findByAccount(account);
		Book book = bookService.findById(book_id);
		comment.setBook(book);
		comment.setUser(user);
		comment.setCreated_at(Utils.getCurrentDate());
		return commentRepository.save(comment);
	}
}
