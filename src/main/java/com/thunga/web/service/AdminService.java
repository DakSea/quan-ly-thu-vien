package com.thunga.web.service;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thunga.web.entity.Account;
import com.thunga.web.entity.Admin;
import com.thunga.web.entity.User;
import com.thunga.web.repository.AdminRepository;
import com.thunga.web.repository.UserRepository;

import utils.Utils;

@Service
public class AdminService {
	@Autowired  AdminRepository adminRepository;
	
	@Autowired AccountService accountService;
	
	@Autowired PasswordEncoder passwordEncoder;
	public Admin findByAccount(Account account) {
		return adminRepository.findByAccount(account);
	}
	
	public Admin update(Admin admin, HttpServletRequest request) {
		Admin updateAmin = adminRepository.findById(admin.getId()).get();
		updateAmin.setAddress(admin.getAddress());
		updateAmin.setName(admin.getName());
		updateAmin.setPhone(admin.getPhone());
		updateAmin.getAccount().setEmail(request.getParameter("email"));
		updateAmin.getAccount().setUpdated_at(Utils.getCurrentDate());
		return adminRepository.save(updateAmin);
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
	
	public Admin save(Admin admin) {
		return adminRepository.save(admin);
	}
}
