package com.ems.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PayrollDTO {
    private Long userId;
    private String userName;
    private BigDecimal baseSalary;
    private BigDecimal hra; // 20% of Base
    private BigDecimal totalLeavesDeduction;
    private BigDecimal tax; // 10%
    private BigDecimal netSalary;
    private int leavesTaken;
    private String status; // PROCESSED or PENDING
}
