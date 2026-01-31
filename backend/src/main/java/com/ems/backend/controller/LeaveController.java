package com.ems.backend.controller;

import com.ems.backend.model.LeaveRequest;
import com.ems.backend.model.LeaveStatus;
import com.ems.backend.model.User;
import com.ems.backend.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;
    private final com.ems.backend.repository.UserRepository userRepository; // Direct repo access to get ID from
                                                                            // UserDetails

    // Employee: Apply
    @PostMapping
    public ResponseEntity<LeaveRequest> applyLeave(@RequestBody LeaveRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmailAndIsActiveTrue(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(leaveService.applyLeave(user.getId(), request));
    }

    // Employee: My History
    @GetMapping("/my")
    public ResponseEntity<List<LeaveRequest>> getMyLeaves(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmailAndIsActiveTrue(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(leaveService.getMyLeaves(user.getId()));
    }

    // HR: Get Pending (or All)
    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getLeaves(@RequestParam(required = false) String status) {
        if ("PENDING".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(leaveService.getPendingLeaves());
        }
        return ResponseEntity.ok(leaveService.getAllLeaves());
    }

    // HR: Approve/Reject
    @PutMapping("/{id}/status")
    public ResponseEntity<LeaveRequest> updateStatus(@PathVariable Long id, @RequestParam LeaveStatus status) {
        return ResponseEntity.ok(leaveService.updateLeaveStatus(id, status));
    }
}
