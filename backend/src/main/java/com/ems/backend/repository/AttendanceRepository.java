package com.ems.backend.repository;

import com.ems.backend.model.Attendance;
import com.ems.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployeeAndDate(User employee, LocalDate date);

    @Query("SELECT a FROM Attendance a WHERE a.date BETWEEN :startDate AND :endDate ORDER BY a.date ASC")
    List<Attendance> findAllByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId AND a.date BETWEEN :startDate AND :endDate ORDER BY a.date ASC")
    List<Attendance> findByEmployeeAndDateRange(@Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Attendance a WHERE YEAR(a.date) = :year AND MONTH(a.date) = :month")
    List<Attendance> findByMonthAndYear(@Param("month") int month, @Param("year") int year);

    // Check if finalized for month
    @Query("SELECT COUNT(a) > 0 FROM Attendance a WHERE YEAR(a.date) = :year AND MONTH(a.date) = :month AND a.finalized = true")
    boolean isMonthFinalized(@Param("month") int month, @Param("year") int year);
}
