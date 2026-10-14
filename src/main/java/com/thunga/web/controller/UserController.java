package com.thunga.web.controller;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.thunga.web.entity.Account;
import com.thunga.web.entity.Book;
import com.thunga.web.entity.Category;
import com.thunga.web.entity.Comment;
import com.thunga.web.entity.Order;
import com.thunga.web.entity.User;
import com.thunga.web.model.CartDetailInfo;
import com.thunga.web.model.CartInfo;
import com.thunga.web.service.AccountService;
import com.thunga.web.service.AuthorService;
import com.thunga.web.service.BookService;
import com.thunga.web.service.CategoryService;
import com.thunga.web.service.CommentService;
import com.thunga.web.service.OrderService;
import com.thunga.web.service.UserService;

import utils.Utils;
@Controller
@Transactional

public class UserController {
@Autowired AuthorService authorService;
	
	@Autowired private BookService bookService;
	
	@Autowired private CategoryService categoryService;
	
	@Autowired private UserService userService;
	
	@Autowired private OrderService orderService;
	
	@Autowired private AccountService accountService;
	
	@Autowired private CommentService commentService;
	
	@PostMapping("/save-comment")
	public String saveComment(Model model, HttpServletRequest request,
							  @ModelAttribute Comment comment) {
		comment = commentService.save(comment, request);
		return "redirect:/detail-product?id=" + comment.getBook().getId();
	}
	
	@GetMapping("/view-cart")
	public String viewCart(Model model, HttpServletRequest request) {
		CartInfo cartInfo = Utils.getCartInSession(request);
		model.addAttribute("cartInfo", cartInfo);
		List<Book> BookInfo = bookService.findAll();
		model.addAttribute("book", BookInfo);
		return "user/cart";
	}
	
	@GetMapping("/remove-book")
	public String removeBook(HttpServletRequest request,
							@RequestParam Integer id) {
		CartInfo cartInfo = Utils.getCartInSession(request);
		cartInfo.removeBook(id);
		return "redirect:/view-cart";
	}
	
	@PostMapping("/add-to-cart")
	public String addToCart(HttpServletRequest request, Model model,
							@RequestParam Integer id, @RequestParam Integer quantity) {
		CartInfo cartInfo = Utils.getCartInSession(request);
		Book book = bookService.findById(id);
		cartInfo.addBook(book, quantity);
		model.addAttribute("cartInfo", cartInfo);
		return "redirect:/detail-product?id=" + id;
	}
	
	@PostMapping("/purchase")
	public String purchase(HttpServletRequest request, Model model) {
		CartInfo cartInfo = Utils.getCartInSession(request);
		for(int i = 0; i < cartInfo.getCartDetails().size(); i++) {
			String sequence = "quantity" + i;
			Integer quantity = Integer.valueOf(request.getParameter(sequence));
			CartDetailInfo cartDetailInfo = cartInfo.getCartDetails().get(i);
			cartDetailInfo.setQuantity(quantity);
		}
		model.addAttribute("cartInfo", cartInfo);
		return "user/purchase_user";
	}
	
	@PostMapping("/confirm")
	public String confirm(HttpServletRequest request, Model model) {
		Order order = new Order(request);
		String username = request.getRemoteUser();
		Account account = accountService.findByUsername(username);
		User user = userService.findByAccount(account);
		order.setUser(user);
		order = orderService.save(order);
		model.addAttribute("order", order);
		Utils.removeCartInSession(request);
		CartInfo cartInfo = Utils.getCartInSession(request);
		model.addAttribute("cartInfo", cartInfo);
		return "user/orderedDetail_user";
	}
	
	//Order
	@GetMapping("/orders")
	public String Orders(Model model, HttpServletRequest request) {
		String username = request.getRemoteUser();
		Account account = accountService.findByUsername(username);
		User user = userService.findByAccount(account);
		model.addAttribute("user", user);
		CartInfo cartInfo = Utils.getCartInSession(request);
		request.setAttribute("cartInfo", cartInfo);
		return "user/order_user";
	}
	@GetMapping("delete-order-user")
	public String deleteOrder(@RequestParam(required = true) Integer id) {
		orderService.delete(orderService.findById(id));
		return "redirect:/orders";
	}

}
