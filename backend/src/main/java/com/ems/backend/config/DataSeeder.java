package com.ems.backend.config;

import com.ems.backend.model.LeaveRequest;
import com.ems.backend.model.LeaveStatus;
import com.ems.backend.model.Role;
import com.ems.backend.model.User;
import com.ems.backend.repository.LeaveRepository;
import com.ems.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LeaveRepository leaveRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("Data Seeding Skipped: Database not empty.");
            return;
        }

        System.out.println("Starting Data Seeding...");

        // 1. Admin
        User admin = User.builder()
                .name("Admin User")
                .email("admin@ems.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.ADMIN)
                .department("Administration")
                .salary(BigDecimal.valueOf(100000))
                .leaveBalance(20)
                .isActive(true)
                .phone("555-ADMIN")
                .address("100 Admin HQ, Suite 1")
                .build();
        userRepository.save(admin);

        // 2. HR
        User hr = User.builder()
                .name("HR Manager")
                .email("hr@ems.com")
                .password(passwordEncoder.encode("password"))
                .role(Role.HR)
                .department("HR")
                .salary(BigDecimal.valueOf(90000))
                .leaveBalance(20)
                .isActive(true)
                .phone("555-HR-001")
                .address("200 HR Lane, Suite 2")
                .build();
        userRepository.save(hr);

        // 3. Employees
        String[] depts = { "IT", "Sales", "HR", "Marketing", "Finance", "Operations" };
        Random random = new Random();
        List<User> employees = new ArrayList<>();

        String[] realNames = {
                "Alice Johnson", "Bob Smith", "Charlie Davis", "Diana Evans", "Ethan Hunt",
                "Fiona Gallagher", "George Miller", "Hannah Wilson", "Ian Malcolm", "Julia Roberts",
                "Kevin Hart", "Laura Croft", "Michael Scott", "Nina Simone", "Oscar Isaac"
        };

        for (int i = 0; i < realNames.length; i++) {
            String name = realNames[i];
            String email = name.toLowerCase().replace(" ", ".") + "@ems.com";
            String dept = depts[random.nextInt(depts.length)];

            // Varied salaries based on department/random
            BigDecimal baseSalary = BigDecimal.valueOf(60000 + random.nextInt(90000)); // 60k - 150k

            User emp = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode("password"))
                    .role(Role.EMPLOYEE)
                    .department(dept)
                    .salary(baseSalary)
                    .leaveBalance(15 + random.nextInt(10))
                    .isActive(true)
                    .phone(String.format("555-01%02d", i))
                    .address(String.format("%d Corporate Blvd, Suite %d", 100 + i, 200 + i))
                    .build();
            employees.add(emp);
        }
        employees = userRepository.saveAll(employees);

        // 4. Leave Requests
        List<LeaveRequest> leaveRequests = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Pending leaves (future)
        for (int i = 0; i < 5; i++) {
            User u = employees.get(random.nextInt(employees.size()));
            leaveRequests.add(LeaveRequest.builder()
                    .user(u)
                    .startDate(today.plusDays(i + 1))
                    .endDate(today.plusDays(i + 3))
                    .reason("Personal Leave " + i)
                    .status(LeaveStatus.PENDING)
                    .build());
        }

        // Approved leaves (ongoing/past)
        for (int i = 0; i < 5; i++) {
            User u = employees.get(random.nextInt(employees.size()));
            leaveRequests.add(LeaveRequest.builder()
                    .user(u)
                    .startDate(today.minusDays(5)) // was 5 days ago
                    .endDate(today.plusDays(2)) // ends in 2 days (so ON LEAVE TODAY)
                    .reason("Vacation " + i)
                    .status(LeaveStatus.APPROVED)
                    .build());
        }

        leaveRepository.saveAll(leaveRequests);
        System.out.println("Data Seeding Completed Successfully.");
    }
}
