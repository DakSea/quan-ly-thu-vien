package com.thunga.web.service;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thunga.web.entity.Account;
import com.thunga.web.entity.User;
import com.thunga.web.repository.UserRepository;

import utils.Utils;

@Service
public class UserService {
	@Autowired UserRepository userRepository;
	
	@Autowired AccountService accountService;
	
	@Autowired PasswordEncoder passwordEncoder;
	
	public List<User> findAll(){
		return userRepository.findAll();
	}
	
	public User findById(Integer id) {
		return userRepository.findById(id).get();
	}
	
	public User findByName(String name) {
		return userRepository.findByName(name);
	}
	
	public User findByAccount(Account account) {
		return userRepository.findByAccount(account);
	}
	
	public User update(User user, HttpServletRequest request) {
		User updateUser = userRepository.findById(user.getId()).get();
		updateUser.setAddress(user.getAddress());
		updateUser.setName(user.getName());
		updateUser.setPhone(user.getPhone());
		updateUser.getAccount().setEmail(request.getParameter("email"));
		updateUser.getAccount().setUpdated_at(Utils.getCurrentDate());
		return userRepository.save(updateUser);
	}
	
	public String changePassword(HttpServletRequest request) {
		String username = request.getRemoteUser();
		Account account = accountService.findByUsername(username);
		String oldPassword = request.getParameter("oldPassword");
		if(!account.getDecryptedPassword().equals(oldPassword)) return "Mật khẩu cũ không chính xác";
		String newPassword = request.getParameter("newPassword");
		if(newPassword.length() < 5) return "Mật khẩu mới cần có tối thiểu 5 ký tự";
		String confirmNewPassword = request.getParameter("confirmNewPassword");
		if(!confirmNewPassword.equals(newPassword)) return "Mật khẩu xác nhận không khớp";
		else {
			account.setDecryptedPassword(newPassword);
			account.setPassword(passwordEncoder.encode(newPassword));
			account.setUpdated_at(Utils.getCurrentDate());
			accountService.save(account);
		}
		return "Thành công";
		
	}
	
	public User save(User user) {
		return userRepository.save(user);
	}
	
	public void delete(User user) {
		userRepository.delete(user);
	}
	
	public Page<User> findByLimit(Integer page, Integer limit, String sortBy){
		Pageable paging = PageRequest.of(page, limit);
		if(sortBy != null) paging = PageRequest.of(page, limit, Sort.by(sortBy));
		Page<User> users = userRepository.findAll(paging);
		return users;
	}
}
