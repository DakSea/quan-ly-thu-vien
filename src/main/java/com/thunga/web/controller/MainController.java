package com.thunga.web.controller;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.support.SessionStatus;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.thunga.web.entity.Account;
import com.thunga.web.entity.Admin;
import com.thunga.web.entity.Book;
import com.thunga.web.entity.Comment;
import com.thunga.web.entity.User;
import com.thunga.web.entity.Category;
import com.thunga.web.form.AccountForm;
import com.thunga.web.model.CartInfo;
import com.thunga.web.service.AccountService;
import com.thunga.web.service.AdminService;
import com.thunga.web.service.BookService;
import com.thunga.web.service.CategoryService;
import com.thunga.web.service.UserService;
import com.thunga.web.validator.AccountValidator;

import utils.Utils;

@Controller
public class MainController {
	
	@Autowired private BookService bookService;
	
	@Autowired private AccountValidator accountValidator;
	
	@Autowired private AccountService accountService;
	
	@Autowired private UserService userService;
	
	@Autowired private AdminService adminService;
	
	@Autowired private PasswordEncoder passwordEncoder;
	
	@Autowired private CategoryService categoryService;
	
	@InitBinder
	protected void initBinder(WebDataBinder dataBinder) {
		Object target = dataBinder.getTarget();
		if (target == null)
			return;
		if (target.getClass() == AccountForm.class) {
			dataBinder.setValidator(accountValidator);
		}
	}

	
	@GetMapping("/")
	public String homepage(Model model, HttpServletRequest request) {
		Page<Book> bookPage = bookService.findByLimit(0, 6, null);
		model.addAttribute("bookList", bookPage.toList());
		model.addAttribute("bestSoldBook", bookService.findBestSoldBook());
		CartInfo cartInfo = Utils.getCartInSession(request);
		model.addAttribute("cartInfo", cartInfo);
		return "home";
	}
	
	@GetMapping("/signup")
	public String signup(Model model) {
		AccountForm accountForm = new AccountForm();
		model.addAttribute("accountForm", accountForm);
		return "signup";
	}
	
	@PostMapping("/signup")
	public String signup(Model model, @ModelAttribute @Validated AccountForm accountForm, BindingResult result) {
		System.out.println(model.getAttribute("accountForm"));
		if (result.hasErrors()) {
			model.addAttribute("error", "Lỗi đăng kí");
			if (result.getFieldError("userName") != null) {
				model.addAttribute("userNameError", result.getFieldError("userName").getDefaultMessage());
			}
			if (result.getFieldError("password") != null) {
				model.addAttribute("passwordError", result.getFieldError("password").getDefaultMessage());
			}
			if (result.getFieldError("fullName") != null) {
				model.addAttribute("fullNameError", result.getFieldError("fullName").getDefaultMessage());
			}
			if (result.getFieldError("email") != null) {
				model.addAttribute("emailError", result.getFieldError("email").getDefaultMessage());
			}
			if (result.getFieldError("confirmPassword") != null) {
				model.addAttribute("confirmPasswordError", result.getFieldError("confirmPassword").getDefaultMessage());
			}
			if (result.getFieldError("address") != null) {
				model.addAttribute("addressError", result.getFieldError("address").getDefaultMessage());
			}
			return "signup";
		}
		Account account = new Account(accountForm);
		account.setPassword(passwordEncoder.encode(account.getDecryptedPassword()));
		account.setCreated_at(Utils.getCurrentDate());
		User user = new User();
		user.setName(accountForm.getFullName());
		user.setAddress(accountForm.getAddress());
		user.setAccount(account);
		accountService.save(account);
		userService.save(user);
		model.addAttribute("message", "Đăng ký thành công");
		return "login";
	}
	
	@GetMapping("/login")
	public String login(HttpServletRequest request, Model model) {
		Object object = request.getSession().getAttribute("SPRING_SECURITY_LAST_EXCEPTION"); //lỗi đăng nhập gần nhất
		model.addAttribute("error", object);
		return "login";
	}
	
	@GetMapping("/bookImage") //load ảnh lên
	public void productImage(HttpServletRequest request, HttpServletResponse response, Model model,
			@RequestParam("id") Integer id) throws IOException {
		// lấy book trong DB theo id
		Book book = bookService.findById(id);
		if (book != null && book.getImage() != null) {
			response.setContentType("image/jpeg, image/jpg, image/png, image/gif");
			response.getOutputStream().write(book.getImage());
		}
		response.getOutputStream().close();
	}
	
	@GetMapping("/products")
	public String products(Model model, HttpServletRequest request,
						   @RequestParam(required = false) Integer page,
						   @RequestParam(required = false) String sortBy) {
		if (page == null) page = 1;
		Page<Book> bookPage = bookService.findByLimit(page - 1, 12, sortBy);
		model.addAttribute("bookList", bookPage.toList());
//		for(Book book: bookPage.toList()) System.out.println(book);
		CartInfo cartInfo = Utils.getCartInSession(request);
		model.addAttribute("cartInfo", cartInfo);
		List<Category> cateInfo = categoryService.findAll();
		model.addAttribute("categoryList", cateInfo);
		return "products";
	}
	
	@GetMapping("/search")
	public String searchProduct(Model model, HttpServletRequest request,
								@RequestParam String type,
								@RequestParam String keyword) {
		List<Book> bookList = bookService.search(type, keyword);
		model.addAttribute("bookList", bookList);
		if(!type.equals("category")) model.addAttribute("keyword", keyword);
		CartInfo cartInfo = Utils.getCartInSession(request);
		model.addAttribute("cartInfo", cartInfo);
		List<Category> cateInfo = categoryService.findAll();
		model.addAttribute("categoryList", cateInfo);
		return "products";
	}
	
	@GetMapping("/detail-product")
	public String detailProduct(Model model, HttpServletRequest request,
								@RequestParam(required = false) Integer id) {
		Book book = bookService.findById(id);
		model.addAttribute("book", book);
		String username = request.getRemoteUser();
		CartInfo cartInfo = Utils.getCartInSession(request);
		model.addAttribute("cartInfo", cartInfo);
		model.addAttribute("username", username);
		model.addAttribute("comment", new Comment());
		List<Category> cateInfo = categoryService.findAll();
		model.addAttribute("categoryList", cateInfo);
		return "/productdetail";
	}
	
	@GetMapping("/profile")
	public String profile(Model model, HttpServletRequest request) {
		String username = request.getRemoteUser();
		Account account = accountService.findByUsername(username);
		//message kết quả change-password
		String message = (String) request.getSession().getAttribute("message");
		model.addAttribute("message", message);
		if(account.getRole().equals("ROLE_ADMIN")) {
			Admin admin = adminService.findByAccount(account);
			model.addAttribute("admin", admin);
			request.getSession().removeAttribute("message");
			return "admin/profile_ad";
		}
		else {
			User user = userService.findByAccount(account);
			model.addAttribute("user", user);
			CartInfo cartInfo = Utils.getCartInSession(request);
			model.addAttribute("cartInfo", cartInfo);
		}
		
		request.getSession().removeAttribute("message");
		return "user/profile_user";
	}
	
	@PostMapping("/save-user")
	public String saveUser(Model model, @ModelAttribute User user, HttpServletRequest request) {
		User updateUser = userService.update(user, request);
		model.addAttribute("user", updateUser);
		return "redirect:/profile";
	}
	
	@PostMapping("/save-admin")
	public String saveAdmin(Model model, @ModelAttribute Admin admin, HttpServletRequest request) {
		Admin updateAdmin = adminService.update(admin, request);
		model.addAttribute("admin", updateAdmin);
		return "redirect:/profile";
	}
	
	//user, admin dùng chung method này do chỉ thao tác với account
	@PostMapping("change-password")
	public String changePassword(Model model, HttpServletRequest request) {
		String message = userService.changePassword(request);
		request.getSession().setAttribute("message", message);
		return "redirect:/profile";
	}
}
