package com.thunga.web.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thunga.web.entity.Account;
import com.thunga.web.entity.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {
	Admin findByAccount(Account account);
}
