package com.chat.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chat.app.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{
	boolean existsByUsername(String username);
	void deleteByUsername(String username);
	Optional<User> findByUsername(String username);
}
