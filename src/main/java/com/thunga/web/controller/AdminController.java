package com.thunga.web.controller;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServlet;
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

import com.thunga.web.entity.Author;
import com.thunga.web.entity.Book;
import com.thunga.web.entity.Category;
import com.thunga.web.entity.Order;
import com.thunga.web.entity.User;
import com.thunga.web.model.CartInfo;
import com.thunga.web.entity.Account;
import com.thunga.web.entity.Admin;
import com.thunga.web.service.AuthorService;
import com.thunga.web.service.BookService;
import com.thunga.web.service.CategoryService;
import com.thunga.web.service.OrderService;
import com.thunga.web.service.UserService;
import com.thunga.web.validator.BookValidator;

import utils.Utils;

import com.thunga.web.service.AccountService;

@Controller
@Transactional
public class AdminController {
	
	@Autowired AuthorService authorService;
	
	@Autowired BookService bookService;
	
	@Autowired CategoryService categoryService;
	
	@Autowired UserService userService;
	
	@Autowired OrderService orderService;
	
	@Autowired AccountService accountService;
	
	@Autowired BookValidator bookValidator;
	
	@GetMapping("/manage-product")
	public String manageProduct(Model model,
							   @RequestParam(required = false) Integer page, 
							   @RequestParam(required = false) String sortBy) {
		if (page == null) page = 1;
		Page<Book> bookPage = bookService.findByLimit(page - 1, 10, sortBy);
		model.addAttribute("bookList", bookPage.toList());
		model.addAttribute("totalPage", bookPage.getTotalPages());
		return "admin/products_ad";
	}
	
	@GetMapping("/edit-product") //create, edit dùng chung method này
	public String editProduct(Model model, @RequestParam(required = false) Integer id) {
		Book book;
		List<Author> authorList = authorService.findAll();
		List<Category> categoryList = categoryService.findAll();
		model.addAttribute("categoryList", categoryList);
		model.addAttribute("authorList", authorList);
		if(id != null) {
			book = bookService.findById(id);
			model.addAttribute("action", "view");
		}
		else {
			book = new Book();
			book.setNewBook(true);
			model.addAttribute("action", "create");
		}
		model.addAttribute("book", book);
		
		return "admin/productdetail_ad";
	}
	
	@PostMapping("/save-product")
	public String saveProduct(Model model, @ModelAttribute Book book, 
							  HttpServletRequest request) throws IOException {
		if(book.getId() == null) {
			Author author = authorService.findByName(request.getParameter("authorInfo"));
			Category category = categoryService.findByName(request.getParameter("categoryInfo"));
			book.setAuthor(author);
			book.setCategory(category);
			if(!bookValidator.validate(book)) {
				model.addAttribute("error", "Sách bị trùng tiêu đề và tác giả");
				model.addAttribute("book", book);
				model.addAttribute("action", "create");
				List<Category> categoryList = categoryService.findAll();
				model.addAttribute("categoryList", categoryList);
				List<Author> authorList = authorService.findAll();
				model.addAttribute("authorList", categoryList);
				return "admin/productdetail_ad";
			}
		}
		Book updateBook = bookService.updateInfo(book, request);
		return "redirect:/edit-product?&id=" + updateBook.getId();
	}
	
	@GetMapping("/delete-product")
	public String deleteProduct(@RequestParam Integer id) {
		bookService.deleteById(id);
		return "redirect:/manage-product";
	}
	
	//Author
	@PostMapping("/create-author")
	public String createAuthor(HttpServletRequest request) {
		String name = request.getParameter("name");
		String description = request.getParameter("description");
		Author author = new Author();
		author.setName(name);
		author.setDescription(description);
		author.setCreated_at(Utils.getCurrentDate());
		authorService.save(author);
		return "redirect:/manage-author";
	}
	
	@GetMapping("/manage-author")
	public String manageAuthor(Model model,
							   @RequestParam(required = false) Integer page) {
		if (page == null) page = 1;
		Page<Author> authorPage = authorService.findByLimit(page - 1, 10);
		model.addAttribute("authorList", authorPage.toList());
		model.addAttribute("totalPage", authorPage.getTotalPages());
		return "admin/authors_ad";
	}
	
	@PostMapping("/edit-author")
	public String editAuthor(Model model, HttpServletRequest request) {
		int id = Integer.valueOf(request.getParameter("id"));
		Author author = authorService.findById(id);
		author.setName(request.getParameter("name"));
		author.setDescription(request.getParameter("description"));
		author.setUpdated_at(Utils.getCurrentDate());
		authorService.save(author);
		return "redirect:/manage-author";
	}
	
	@GetMapping("delete-author")
	public String deleteAuthor(@RequestParam(required = true) Integer id) {
		authorService.delete(authorService.findById(id));
		return "redirect:/manage-author";
	}
	
	//Category
	@GetMapping("/manage-category")
	public String manageCategory(Model model,HttpServletRequest request,
							   @RequestParam(required = false) Integer page,
							   @RequestParam(required = false) String sortBy) {
		if (page == null) page = 1;
		Page<Category> categoryPage = categoryService.findByLimit(page - 1, 10, sortBy);
		model.addAttribute("categoryList", categoryPage.toList());
		model.addAttribute("totalPage", categoryPage.getTotalPages());
		return "admin/category_book_ad";
	}
	
	@PostMapping("/create-category")
	public String createCategory(HttpServletRequest request) {
		String name = request.getParameter("name");
		Category category = new Category();
		category.setName(name);
		category.setCreated_at(Utils.getCurrentDate());
		categoryService.save(category);
		return "redirect:/manage-category";
	}
	
	@PostMapping("/edit-category")
	public String editCategory(Model model, HttpServletRequest request) {
		int id = Integer.valueOf(request.getParameter("id"));
		Category category = categoryService.findById(id);
		category.setName(request.getParameter("name"));
		category.setUpdated_at(Utils.getCurrentDate());
		categoryService.save(category);
		return "redirect:/manage-category";
	}
	
	@GetMapping("delete-category")
	public String deleteCategory(@RequestParam(required = true) Integer id) {
		categoryService.delete(categoryService.findById(id));
		return "redirect:/manage-category";
	}
	
	//User
	@GetMapping("/manage-user")
	public String manageUser(Model model,HttpServletRequest request,
			   @RequestParam(required = false) Integer page,
			   @RequestParam(required = false) String sortBy) {
		if (page == null) page = 1;
		Page<User> userPage = userService.findByLimit(page - 1, 10, sortBy);
		model.addAttribute("userList", userPage.toList());
		model.addAttribute("totalPage", userPage.getTotalPages());
		return "admin/user_ad";
	}
	
	@GetMapping("delete-user")
	public String deleteUser(@RequestParam(required = true) Integer id) {
		userService.delete(userService.findById(id));
		return "redirect:/manage-user";
	}
	@GetMapping("/edit-user") 
	public String editUser(Model model, @RequestParam(required = false) Integer id) {
		User user;
		user = userService.findById(id);
		model.addAttribute("user", user);
		
		return "admin/user_detail_ad";
	}
	
	@PostMapping("/save-user-ad")
	public String saveUser(Model model, @ModelAttribute User user, HttpServletRequest request) {
		User updateUser = userService.update(user, request);
		model.addAttribute("user", updateUser);
		return "admin/user_detail_ad";
	}
	//Order
	@GetMapping("/manage-order")
	public String manageOrder(Model model, HttpServletRequest request,
			   @RequestParam(required = false) Integer page,
			   @RequestParam(required = false) String sortBy) {
		if (page == null) page = 1;
		Page<Order> orderPage = orderService.findByLimit(page - 1, 10, sortBy);
		model.addAttribute("orderList", orderPage.toList());
		model.addAttribute("totalPage", orderPage.getTotalPages());
		return "admin/orders_ad";
	}
	
	@GetMapping("/manage-orderDetail") 
	public String manageOderDetail(Model model,HttpServletRequest request, 
				@RequestParam(required = false) Integer id) {
		Order order;
		order = orderService.findById(id);
		model.addAttribute("order", order);
		CartInfo cartInfo = Utils.getCartInSession(request);
		request.setAttribute("cartInfo", cartInfo);
		return "admin/order_detail_ad";
	}
	@PostMapping("/edit-order")
	public String editOrder(Model model, HttpServletRequest request) {
		int id = Integer.valueOf(request.getParameter("id"));
		Order order = orderService.findById(id);
		order.setStatus(request.getParameter("status"));
		order.setUpdated_at(Utils.getCurrentDate());
		orderService.save(order);
		return "redirect:/manage-order";
	}
	@GetMapping("delete-order")
	public String deleteOrder(@RequestParam(required = true) Integer id) {
		orderService.delete(orderService.findById(id));
		return "redirect:/manage-order";
	}
	
	//thống kê
	
}

