package com.ems.backend.repository;

import com.ems.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Soft Delete: Always filter by isActive = true
    Optional<User> findByEmailAndIsActiveTrue(String email);

    // Search by Name or Department (Soft Delete enforced)
    List<User> findByNameContainingOrDepartmentContainingAndIsActiveTrue(String name, String department);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
    long countActiveUsers();

    @Query("SELECT SUM(u.salary) FROM User u WHERE u.isActive = true")
    Long sumSalaries();

    @Query("SELECT u.department, COUNT(u) FROM User u WHERE u.isActive = true GROUP BY u.department")
    List<Object[]> countUsersByDepartment();
}
