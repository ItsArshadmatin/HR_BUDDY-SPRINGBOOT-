package com.ems.backend.controller;

import com.ems.backend.model.Attendance;
import com.ems.backend.model.AttendanceStatus;
import com.ems.backend.model.User;
import com.ems.backend.repository.AttendanceRepository;
import com.ems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class DataSeederController {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final Random random = new Random();

    @PostMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Transactional
    public ResponseEntity<String> seedAttendance(@RequestParam int month, @RequestParam int year) {
        try {
            List<User> users = userRepository.findAll();
            YearMonth yearMonth = YearMonth.of(year, month);
            int daysInMonth = yearMonth.lengthOfMonth();

            for (User user : users) {
                // Skip inactive users if needed
                if (!user.isActive())
                    continue;

                for (int day = 1; day <= daysInMonth; day++) {
                    LocalDate date = LocalDate.of(year, month, day);

                    // Check if record exists
                    Optional<Attendance> existing = attendanceRepository.findByEmployeeAndDate(user, date);

                    if (existing.isPresent() && existing.get().isFinalized()) {
                        continue; // Skip finalized records
                    }

                    Attendance attendance = existing
                            .orElse(Attendance.builder().employee(user).date(date).finalized(false).build());

                    DayOfWeek dayOfWeek = date.getDayOfWeek();
                    if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
                        attendance.setStatus(AttendanceStatus.PRESENT);
                        attendance.setRemarks("Weekend");
                    } else {
                        int chance = random.nextInt(100);
                        if (chance < 80) {
                            attendance.setStatus(AttendanceStatus.PRESENT);
                            attendance.setRemarks(null);
                        } else if (chance < 85) {
                            attendance.setStatus(AttendanceStatus.HALF_DAY);
                            attendance.setRemarks("Half Day");
                        } else if (chance < 95) {
                            attendance.setStatus(AttendanceStatus.ABSENT);
                            attendance.setRemarks("Uninformed Absence");
                        } else {
                            attendance.setStatus(AttendanceStatus.PRESENT);
                        }
                    }

                    attendanceRepository.save(attendance);
                }
            }
            return ResponseEntity.ok("Seeded attendance for " + users.size() + " users for " + month + "/" + year);

        } catch (Exception e) {
            e.printStackTrace(); // Log to server console
            return ResponseEntity.internalServerError().body("Error seeding data: " + e.getMessage());
        }
    }
}
