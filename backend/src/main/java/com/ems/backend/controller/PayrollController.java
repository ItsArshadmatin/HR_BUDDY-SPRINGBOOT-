package com.ems.backend.controller;

import com.ems.backend.model.Payroll;
import com.ems.backend.service.PayrollService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    // Get Payroll for Month (Admin/HR)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<Payroll>> getPayroll(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.getPayroll(month, year));
    }

    // Get My Payroll (Employee)
    @GetMapping("/my")
    public ResponseEntity<List<Payroll>> getMyPayroll(
            @AuthenticationPrincipal UserDetails userDetails) {
        // Not implemented yet for employees
        return ResponseEntity.ok(java.util.Collections.emptyList());
    }

    // Generate Payroll
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<String> generatePayroll(
            @RequestParam int month,
            @RequestParam int year) {
        payrollService.generatePayroll(month, year);
        return ResponseEntity.ok("Payroll generated successfully for " + month + "/" + year);
    }

    @PostMapping("/{id}/mark-paid")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<Payroll> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.markAsPaid(id));
    }

    // Process Payroll (Simulate Bank Transfer)
    @PostMapping("/process")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<String> processPayroll(
            @RequestParam int month,
            @RequestParam int year) {
        payrollService.processPayroll(month, year);
        return ResponseEntity.ok("Salaries disbursed successfully for " + month + "/" + year);
    }

    // Download Payslip PDF
    @GetMapping("/payslip/{id}")
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long id) {
        try {
            byte[] pdfBytes = payrollService.generatePayslipPdf(id);
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=payslip_" + id + ".pdf")
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}
