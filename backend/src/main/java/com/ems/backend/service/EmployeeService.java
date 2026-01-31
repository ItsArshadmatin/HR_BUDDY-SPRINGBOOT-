package com.ems.backend.service;

import com.ems.backend.model.User;
import com.ems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final UserRepository userRepository;

    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public List<User> searchEmployees(String query) {
        if (query == null || query.isBlank()) {
            return userRepository.findAll().stream()
                    .filter(User::isActive)
                    .toList();
        }
        return userRepository.findByNameContainingOrDepartmentContainingAndIsActiveTrue(query, query);
    }

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User updateUser(Long id, User details) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));

        user.setName(details.getName());
        user.setDepartment(details.getDepartment());
        user.setRole(details.getRole());
        user.setSalary(details.getSalary());

        // Update password only if provided
        if (details.getPassword() != null && !details.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(details.getPassword()));
        }

        return userRepository.save(user);
    }

    public String uploadProfileImage(Long id, org.springframework.web.multipart.MultipartFile file) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
        try {
            // Ensure directory exists
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
            if (!java.nio.file.Files.exists(uploadDir)) {
                java.nio.file.Files.createDirectories(uploadDir);
            }

            String fileName = java.util.UUID.randomUUID() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = uploadDir.resolve(fileName);
            java.nio.file.Files.write(filePath, file.getBytes());

            // Return full URL (assuming backend is regular localhost:8081 for now)
            String imageUrl = "http://localhost:8081/uploads/" + fileName;
            user.setProfileImage(imageUrl);
            userRepository.save(user);
            return imageUrl;
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    public void softDeleteEmployee(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
        user.setActive(false);
        userRepository.save(user);
    }
}
