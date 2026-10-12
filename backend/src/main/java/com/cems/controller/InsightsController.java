package com.cems.controller;

import com.cems.dto.AnalyticsDto;
import com.cems.dto.AuditLogDto;
import com.cems.model.AppUser;
import com.cems.service.AnalyticsService;
import com.cems.service.AuditService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class InsightsController {

    private final AnalyticsService analyticsService;
    private final AuditService auditService;

    public InsightsController(AnalyticsService analyticsService, AuditService auditService) {
        this.analyticsService = analyticsService;
        this.auditService = auditService;
    }

    @GetMapping("/analytics")
    public AnalyticsDto analytics(@AuthenticationPrincipal AppUser user) {
        return analyticsService.compute(user);
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLogDto> auditLogs() {
        return auditService.recent();
    }
}
