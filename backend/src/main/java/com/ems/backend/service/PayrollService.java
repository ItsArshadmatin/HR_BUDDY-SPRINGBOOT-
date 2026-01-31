package com.ems.backend.service;

import com.ems.backend.model.*;
import com.ems.backend.repository.AttendanceRepository;
import com.ems.backend.repository.PayrollRepository;
import com.ems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.List;
import java.time.LocalDateTime;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    @Transactional
    public void generatePayroll(int month, int year) {
        // 1. Check if Attendance is Finalized
        if (!attendanceRepository.isMonthFinalized(month, year)) {
            throw new IllegalStateException("Cannot generate payroll. Attendance for this month is not finalized.");
        }

        // 2. Check if already generated
        if (payrollRepository.existsByMonthAndYear(month, year)) {
            throw new IllegalStateException("Payroll for this month has already been generated.");
        }

        List<User> employees = userRepository.findAll(); // Should filter active
        int totalDaysInMonth = YearMonth.of(year, month).lengthOfMonth();

        for (User employee : employees) {
            // Skip admins or those with 0 salary if needed
            if (employee.getSalary() == null || employee.getSalary().compareTo(BigDecimal.ZERO) <= 0)
                continue;

            // 3. Calculate Payable Days
            List<Attendance> attendanceRecords = attendanceRepository.findByEmployeeAndDateRange(
                    employee.getId(),
                    java.time.LocalDate.of(year, month, 1),
                    java.time.LocalDate.of(year, month, totalDaysInMonth));

            double payableDays = 0;
            // If no attendance records found (e.g. joined mid-month or error), assumes 0
            // payable.
            // In the init logic, we create records for all days. So this should be fine.

            for (Attendance record : attendanceRecords) {
                if (record.getStatus() == AttendanceStatus.PRESENT) {
                    payableDays += 1.0;
                } else if (record.getStatus() == AttendanceStatus.HALF_DAY) {
                    payableDays += 0.5;
                } else if (record.getStatus() == AttendanceStatus.LEAVE) {
                    // Check Leave Type. If Unpaid => 0, else 1
                    if (record.getLeaveRequest() != null
                            && record.getLeaveRequest().getLeaveType() == LeaveType.UNPAID_LEAVE) {
                        payableDays += 0;
                    } else {
                        payableDays += 1.0; // Paid Leave
                    }
                }
                // ABSENT => 0
            }

            // 4. Calculate Salary
            BigDecimal baseSalary = employee.getSalary();
            BigDecimal perDaySalary = baseSalary.divide(BigDecimal.valueOf(totalDaysInMonth), 2, RoundingMode.HALF_UP);

            // Calculation: Net = PerDay * PayableDays
            BigDecimal netSalary = perDaySalary.multiply(BigDecimal.valueOf(payableDays)).setScale(2,
                    RoundingMode.HALF_UP);

            BigDecimal deduction = baseSalary.subtract(netSalary);
            if (deduction.compareTo(BigDecimal.ZERO) < 0)
                deduction = BigDecimal.ZERO;

            // 5. Create Payroll Record
            Payroll payroll = Payroll.builder()
                    .employee(employee)
                    .month(month)
                    .year(year)
                    .baseSalary(baseSalary)
                    .payableDays((int) Math.ceil(payableDays)) // Store as Int as per Entity definition
                    .deductionAmount(deduction)
                    .netSalary(netSalary)
                    .status(PayrollStatus.GENERATED)
                    .build();

            payrollRepository.save(payroll);
        }
    }

    public List<Payroll> getPayroll(int month, int year) {
        return payrollRepository.findByMonthAndYear(month, year);
    }

    public Payroll markAsPaid(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));
        payroll.setStatus(PayrollStatus.PAID);
        payroll.setPaymentDate(LocalDateTime.now());
        return payrollRepository.save(payroll);
    }

    @Transactional
    public void processPayroll(int month, int year) {
        List<Payroll> payrolls = payrollRepository.findByMonthAndYear(month, year);
        if (payrolls.isEmpty()) {
            throw new RuntimeException("No payroll records found for this month to process.");
        }

        // Simulate Bank Communication
        try {
            Thread.sleep(2000); // 2 Seconds
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        for (Payroll p : payrolls) {
            if (p.getStatus() != PayrollStatus.PAID) {
                p.setStatus(PayrollStatus.PAID);
                p.setPaymentDate(LocalDateTime.now());
                payrollRepository.save(p);
            }
        }
    }

    public byte[] generatePayslipPdf(Long payrollId) throws Exception {
        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new RuntimeException("Payroll not found"));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter.getInstance(document, out);

        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

        // Header
        Paragraph title = new Paragraph("EMS Corp.", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph subtitle = new Paragraph(
                "Payslip for " + java.time.Month.of(payroll.getMonth()) + " " + payroll.getYear(), headerFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(subtitle);

        document.add(new Paragraph(" ")); // Spacer

        // Employee Info Table
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.addCell(createCell("Employee Name: " + payroll.getEmployee().getName(), normalFont));
        infoTable.addCell(createCell("Employee ID: EMS-" + payroll.getEmployee().getId(), normalFont));
        infoTable.addCell(createCell("Date Generated: " + java.time.LocalDate.now(), normalFont));
        infoTable.addCell(createCell("Status: " + payroll.getStatus(), normalFont));
        document.add(infoTable);

        document.add(new Paragraph(" "));

        // Earnings Table
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        table.addCell(createCell("Earnings / Deductions", headerFont));
        table.addCell(createCell("Amount (INR)", headerFont));

        table.addCell(createCell("Base Salary", normalFont));
        table.addCell(createCell(payroll.getBaseSalary().toString(), normalFont));

        table.addCell(createCell("Payable Days", normalFont));
        table.addCell(createCell(String.valueOf(payroll.getPayableDays()), normalFont));

        table.addCell(createCell("Deductions", normalFont));
        table.addCell(createCell("-" + payroll.getDeductionAmount().toString(), normalFont));

        table.addCell(createCell("Net Salary", headerFont));
        table.addCell(createCell(payroll.getNetSalary().toString(), headerFont));

        document.add(table);

        // Footer
        document.add(new Paragraph(" "));
        Paragraph footer = new Paragraph("This is a computer-generated document. No signature required.",
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();

        return out.toByteArray();
    }

    private PdfPCell createCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        return cell;
    }
}
