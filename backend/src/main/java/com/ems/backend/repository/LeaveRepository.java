package com.ems.backend.repository;

import com.ems.backend.model.LeaveRequest;
import com.ems.backend.model.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByUserIdOrderByStartDateDesc(Long userId);

    List<LeaveRequest> findByStatusOrderByStartDateDesc(LeaveStatus status);

    long countByStatus(LeaveStatus status);

    @Query("SELECT COUNT(l) FROM LeaveRequest l WHERE l.status = 'APPROVED' AND :today BETWEEN l.startDate AND l.endDate")
    long countApprovedLeavesForDate(@Param("today") LocalDate today);

    // For charts: Approved leaves per month (simplified, assuming we process in
    // service or use DB specific function)
    @Query("SELECT function('MONTHNAME', l.startDate) as month, COUNT(l) as count FROM LeaveRequest l WHERE l.status = 'APPROVED' AND l.startDate >= :dataStart GROUP BY function('MONTHNAME', l.startDate)")
    List<Object[]> countApprovedLeavesByMonth(@Param("dataStart") LocalDate dataStart);
}
