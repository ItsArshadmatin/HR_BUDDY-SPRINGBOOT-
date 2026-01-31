package com.ems.backend.controller;

import com.ems.backend.model.User;
import com.ems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByEmailAndIsActiveTrue(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Security Check: Only allow if ID matches or user is ADMIN
        if (!currentUser.getId().equals(id) && !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }

        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        // Update Allowed Fields
        if (updatedUser.getPhone() != null)
            userToUpdate.setPhone(updatedUser.getPhone());
        if (updatedUser.getAddress() != null)
            userToUpdate.setAddress(updatedUser.getAddress());
        if (updatedUser.getBio() != null)
            userToUpdate.setBio(updatedUser.getBio());

        // Name update (Allowed for now)
        if (updatedUser.getName() != null)
            userToUpdate.setName(updatedUser.getName());

        return ResponseEntity.ok(userRepository.save(userToUpdate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userRepository.findById(id).orElseThrow());
    }
}
