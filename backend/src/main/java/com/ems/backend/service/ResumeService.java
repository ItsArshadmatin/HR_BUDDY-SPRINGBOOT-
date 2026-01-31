package com.ems.backend.service;

import com.ems.backend.dto.AnalysisResultDTO;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Service
public class ResumeService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    // UPDATE: As of Jan 2026, 'gemini-1.5' is deprecated.
    // We must use 'gemini-2.5-flash' which is the current free tier standard.
    private static final String MODEL_NAME = "gemini-2.5-flash";

    // Gemini 2.5 models require the 'v1beta' endpoint
    private static final String API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public AnalysisResultDTO analyzeResume(MultipartFile file, String targetRole) throws IOException {
        String text = extractText(file);

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("YOUR_API_KEY")) {
            return mockAnalysis(text, targetRole, "API Key Missing");
        }

        return callGeminiAPI(text, targetRole);
    }

    private String extractText(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private AnalysisResultDTO callGeminiAPI(String resumeText, String targetRole) {
        try {
            String cleanKey = apiKey.trim();
            // Construct the 2026-compliant URL
            String url = API_ENDPOINT + MODEL_NAME + ":generateContent?key=" + cleanKey;

            String prompt = "Act as an ATS. Analyze this resume for a '" + targetRole + "' role. " +
                    "Return a raw JSON object {score, missingKeywords, summary, recommendation}. " +
                    "Resume: " + resumeText.substring(0, Math.min(resumeText.length(), 10000));

            // JSON Payload
            String jsonPayload = objectMapper.writeValueAsString(Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))))));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            System.out.println("Sending AI Request to: " + MODEL_NAME + " for role: " + targetRole);
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.err.println("Google API Error: " + response.body());
                // Fallback to simulation if the API limit is hit or model is busy
                return mockAnalysis(resumeText, targetRole, "API Error " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());

            if (!root.path("candidates").has(0)) {
                return mockAnalysis(resumeText, targetRole, "AI returned no content");
            }

            String responseText = root.path("candidates").get(0).path("content").path("parts").get(0).path("text")
                    .asText();
            responseText = responseText.replaceAll("```json", "").replaceAll("```", "").trim();

            JsonNode aiJson = objectMapper.readTree(responseText);

            List<String> keywords = new ArrayList<>();
            if (aiJson.has("missingKeywords")) {
                aiJson.get("missingKeywords").forEach(k -> keywords.add(k.asText()));
            }

            return AnalysisResultDTO.builder()
                    .score(aiJson.path("score").asInt(50))
                    .missingKeywords(keywords)
                    .summary(aiJson.path("summary").asText("Analysis Complete"))
                    .recommendation(aiJson.path("recommendation").asText("Review"))
                    .candidateName("Candidate")
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            return mockAnalysis(resumeText, targetRole, "System Error");
        }
    }

    private AnalysisResultDTO mockAnalysis(String text, String targetRole, String reason) {
        // High-Quality Simulation Logic
        int score = 40;
        // Simple heuristic: check if role keywords appear in text
        if (text.toLowerCase().contains(targetRole.toLowerCase()))
            score += 20;
        if (text.toLowerCase().contains("experience"))
            score += 10;

        return AnalysisResultDTO.builder()
                .score(score)
                .missingKeywords(Arrays.asList("Skill A", "Skill B"))
                .summary("Simulated Analysis for " + targetRole + ". Reason: " + reason)
                .recommendation(score > 70 ? "Interview" : "Shortlist")
                .candidateName("Candidate")
                .build();
    }
}