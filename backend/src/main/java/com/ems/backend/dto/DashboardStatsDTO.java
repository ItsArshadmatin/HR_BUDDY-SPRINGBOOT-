package com.ems.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDTO {
    private long totalStaff;
    private long onLeaveToday;
    private long pendingRequests;
    private BigDecimal estPayrollCost;

    // Charts
    private Map<String, Long> departmentDistribution;
    private Map<String, Long> leaveTrends; // e.g., "JAN-2024" -> 5
}
