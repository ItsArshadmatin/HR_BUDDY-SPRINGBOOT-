package com.ems.backend.service;

import com.ems.backend.model.LeaveRequest;
import com.ems.backend.model.LeaveStatus;
import com.ems.backend.model.User;
import com.ems.backend.repository.LeaveRepository;
import com.ems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;
    private final AttendanceService attendanceService;

    // Apply for Leave
    public LeaveRequest applyLeave(Long userId, LeaveRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        if (request.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new IllegalArgumentException("Cannot apply for leave in the past");
        }

        long daysRequested = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (user.getLeaveBalance() < daysRequested) {
            throw new IllegalArgumentException("Insufficient leave balance. Requesting: " + daysRequested
                    + ", Available: " + user.getLeaveBalance());
        }

        request.setUser(user);
        request.setStatus(LeaveStatus.PENDING);
        return leaveRepository.save(request);
    }

    // Get My Leaves
    public List<LeaveRequest> getMyLeaves(Long userId) {
        return leaveRepository.findByUserIdOrderByStartDateDesc(userId);
    }

    // Get Pending Leaves (HR)
    public List<LeaveRequest> getPendingLeaves() {
        return leaveRepository.findByStatusOrderByStartDateDesc(LeaveStatus.PENDING);
    }

    // Get All Leaves (HR)
    public List<LeaveRequest> getAllLeaves() {
        return leaveRepository.findAll(org.springframework.data.domain.Sort
                .by(org.springframework.data.domain.Sort.Direction.DESC, "startDate"));
    }

    // Approve/Reject Leave
    public LeaveRequest updateLeaveStatus(Long leaveId, LeaveStatus status) {
        LeaveRequest leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

        if (leave.getStatus() != LeaveStatus.PENDING) {
            throw new IllegalStateException("Leave request is already processed");
        }

        if (status == LeaveStatus.APPROVED) {
            User user = leave.getUser();
            long days = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;

            if (user.getLeaveBalance() < days) {
                throw new IllegalArgumentException("User no longer has sufficient balance");
            }

            user.setLeaveBalance((int) (user.getLeaveBalance() - days));
            userRepository.save(user);

            // Update Attendance
            try {
                attendanceService.handleLeaveApproval(leave);
            } catch (Exception e) {
                // Log and ignore? Or fail transaction? Fail transaction is safer.
                throw new RuntimeException("Failed to update attendance records: " + e.getMessage());
            }
        }

        leave.setStatus(status);
        return leaveRepository.save(leave);
    }
}
