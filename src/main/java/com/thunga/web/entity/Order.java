package com.thunga.web.entity;

import java.util.ArrayList;
import java.util.Collection;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.servlet.http.HttpServletRequest;

import com.thunga.web.model.CartDetailInfo;
import com.thunga.web.model.CartInfo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import utils.Utils;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "purchase")
public class Order {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;
	
	@OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
	@ToString.Exclude
	private Collection<OrderDetail> orderDetailList;
	
	private Integer total_cost;
	
	private String customer_name;
	private String address;
	private String phone;
	private String status;
	private String created_at;
	private String updated_at;
	
	public Order(HttpServletRequest request) {
		CartInfo cartInfo = Utils.getCartInSession(request);
		this.orderDetailList = new ArrayList<>();
		this.total_cost = cartInfo.getAmount();
		this.customer_name = request.getParameter("fullname");
		this.phone = request.getParameter("phone");
		this.address = request.getParameter("address");
		this.status = "Đang chờ duyệt";
		for(CartDetailInfo cartDetailInfo: cartInfo.getCartDetails()) {
			OrderDetail orderDetail = new OrderDetail(cartDetailInfo);
			orderDetail.setOrder(this);
			this.orderDetailList.add(orderDetail);
		}
		this.created_at = Utils.getCurrentDate();
	}
}
