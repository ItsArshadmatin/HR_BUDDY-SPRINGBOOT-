package com.ems.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AnalysisResultDTO {
    private int score;
    private List<String> missingKeywords;
    private String summary;
    private String candidateName; // Extracted potentially
    private String recommendation; // Hire, Interview, Reject
}
