package com.ems.backend.controller;

import com.ems.backend.model.User;
import com.ems.backend.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<List<User>> getEmployees(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(employeeService.searchEmployees(search));
    }

    @PostMapping
    public ResponseEntity<User> createEmployee(@RequestBody @jakarta.validation.Valid User user) {
        return ResponseEntity.ok(employeeService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateEmployee(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(employeeService.updateUser(id, user));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<String> uploadImage(@PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(employeeService.uploadProfileImage(id, file));
    }

    @PutMapping("/{id}/soft-delete")
    public ResponseEntity<Void> softDeleteEmployee(@PathVariable Long id) {
        employeeService.softDeleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
