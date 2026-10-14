package com.thunga.web.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.thunga.web.entity.Author;
import com.thunga.web.entity.Book;
import com.thunga.web.entity.Category;

@Repository
public interface BookRepository extends JpaRepository<Book, Integer> {
	@Query(value = "SELECT  * FROM book_libary.book ORDER BY number_sold DESC LIMIT 1", nativeQuery = true)
	Book findBestSoldBook();
	
	List<Book> findByTitle(String title);
	
	@Query(value = "SELECT * FROM book WHERE title COLLATE utf8mb4_unicode_ci LIKE ?1", nativeQuery = true)
	List<Book> findBySimilarTitle(String title, Pageable pageable);
	
	List<Book> findByAuthor(Author author);
	
	@Query(value = "SELECT * FROM book LEFT JOIN author ON author_id = author.id\r\n"
				 + "WHERE author.name COLLATE utf8mb4_unicode_ci LIKE ?1", nativeQuery = true)
	List<Book> findBySimilarAuthor(String authorName, Pageable pageable);
	
	List<Book> findByCategory(Category category, Pageable pageable);
	
}

