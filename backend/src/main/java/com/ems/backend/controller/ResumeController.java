package com.ems.backend.controller;

import com.ems.backend.dto.AnalysisResultDTO;
import com.ems.backend.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/ats")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/analyze", consumes = "multipart/form-data")
    public ResponseEntity<AnalysisResultDTO> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "role", defaultValue = "Software Engineer") String role) throws IOException {
        return ResponseEntity.ok(resumeService.analyzeResume(file, role));
    }
}
