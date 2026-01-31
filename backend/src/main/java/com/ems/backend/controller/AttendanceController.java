package com.ems.backend.controller;

import com.ems.backend.model.Attendance;
import com.ems.backend.model.AttendanceStatus;
import com.ems.backend.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // Get Attendance for Month (Filter by Dept if needed)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<Attendance>> getAttendance(
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam(required = false) Long departmentId) {
        return ResponseEntity.ok(attendanceService.getAttendance(month, year, departmentId));
    }

    // Initialize Attendance for Month (Auto-create)
    @PostMapping("/init")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<String> initializeMonth(
            @RequestParam int month,
            @RequestParam int year) {
        attendanceService.initializeMonth(year, month);
        return ResponseEntity.ok("Attendance initialized for " + month + "/" + year);
    }

    // Update Single Record
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Attendance> updateAttendance(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        AttendanceStatus status = AttendanceStatus.valueOf(payload.get("status"));
        String remarks = payload.get("remarks");

        return ResponseEntity.ok(attendanceService.updateAttendance(id, status, remarks));
    }

    // Finalize Month
    @PostMapping("/finalize")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<String> finalizeMonth(
            @RequestParam int month,
            @RequestParam int year) {
        attendanceService.finalizeMonth(month, year);
        return ResponseEntity.ok("Attendance finalized for " + month + "/" + year);
    }
}
