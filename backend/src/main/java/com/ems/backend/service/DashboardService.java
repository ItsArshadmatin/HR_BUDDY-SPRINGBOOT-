package com.ems.backend.service;

import com.ems.backend.dto.DashboardStatsDTO;
import com.ems.backend.model.LeaveStatus;
import com.ems.backend.repository.LeaveRepository;
import com.ems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final LeaveRepository leaveRepository;

    public DashboardStatsDTO getStats() {
        // 1. Total Staff
        long totalStaff = userRepository.countActiveUsers();

        // 2. On Leave Today
        long onLeaveToday = leaveRepository.countApprovedLeavesForDate(LocalDate.now());

        // 3. Pending Requests
        long pendingRequests = leaveRepository.countByStatus(LeaveStatus.PENDING);

        // 4. Est. Payroll Cost
        Long totalSalary = userRepository.sumSalaries();
        BigDecimal estPayrollCost = (totalSalary != null) ? BigDecimal.valueOf(totalSalary) : BigDecimal.ZERO;

        // 5. Dept Distribution
        Map<String, Long> departmentDistribution = new HashMap<>();
        List<Object[]> deptCounts = userRepository.countUsersByDepartment();
        for (Object[] row : deptCounts) {
            String dept = (String) row[0];
            Long count = (Long) row[1];
            if (dept != null) {
                departmentDistribution.put(dept, count);
            }
        }

        // 6. Leave Trends (Placeholder logic for now, or simple query)
        // Ideally we group by Month in DB. simpler to just return empty or dummy for
        // now until we have data.
        Map<String, Long> leaveTrends = new HashMap<>();
        // Example: leaveTrends = leaveRepository.findApprovedLeavesLast6Months();

        return DashboardStatsDTO.builder()
                .totalStaff(totalStaff)
                .onLeaveToday(onLeaveToday)
                .pendingRequests(pendingRequests)
                .estPayrollCost(estPayrollCost)
                .departmentDistribution(departmentDistribution)
                .leaveTrends(leaveTrends)
                .build();
    }
}
