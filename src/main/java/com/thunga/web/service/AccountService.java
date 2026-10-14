package com.thunga.web.service;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thunga.web.entity.Account;
import com.thunga.web.model.AccountDetails;
import com.thunga.web.repository.AccountRepository;

import utils.Utils;

@Service
public class AccountService implements UserDetailsService {
	
	@Autowired
	private AccountRepository accountRepository;
	
	
	public List<Account> findAll(){
		return accountRepository.findAll();
	}
	
	public Account findByUsername(String username) {
		return accountRepository.findByUsername(username);
	}
	
	public Account save(Account account) {
		return accountRepository.save(account);
	}
	
	
	
	@Override
	public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {
		Account account = accountRepository.findByUsername(userName);
		if (account == null) {
			throw new UsernameNotFoundException("Tài khoản không tồn tại");
		}
		return new AccountDetails(account);
	}

}
