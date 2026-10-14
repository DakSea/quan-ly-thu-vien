package com.thunga.web.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.thunga.web.service.AccountService;

@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter{
	
	@Autowired
	AccountService accountService;
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(accountService)		// Cung cấp userservice cho spring security
			.passwordEncoder(passwordEncoder());	// cung cấp password encoder
	}
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http.csrf().disable();
		http.authorizeRequests().antMatchers("/", "/signup", "/login").permitAll();
		http.authorizeRequests().antMatchers("/cart", "/orderList","/profile", "/view-cart", "/orders")
		.access("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')");
		
		//request cho Admin
		http.authorizeRequests().antMatchers("/manage-product","/manage-order",
				"/manage-category", "/manage-user",  "/manage-author")
		.access("hasRole('ROLE_ADMIN')");
		
		//request cho User
		http.authorizeRequests().antMatchers("/add-to-cart")
		.access("hasRole('ROLE_USER')");
		
		http.authorizeRequests()
	        .and()
	        .formLogin() // Cho phép người dùng xác thực bằng form login
	        .loginProcessingUrl("/j_spring_security_check")
	        .loginPage("/login")
	        .defaultSuccessUrl("/")
	        .failureUrl("/login?error=true")
	        .usernameParameter("username")
	        .passwordParameter("password")
	        .and().logout().logoutUrl("/logout").logoutSuccessUrl("/");
	}

}
	
	
