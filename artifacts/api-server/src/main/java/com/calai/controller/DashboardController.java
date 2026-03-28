package com.calai.controller;

import com.calai.dto.dashboard.DailyStatsDto;
import com.calai.dto.dashboard.WeeklyStatsDto;
import com.calai.security.UserPrincipal;
import com.calai.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/daily")
    public ResponseEntity<DailyStatsDto> getDaily(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String date) {
        return ResponseEntity.ok(dashboardService.getDailyStats(principal.getUser(), date));
    }

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyStatsDto> getWeekly(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getWeeklyStats(principal.getUser()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<WeeklyStatsDto> getMonthly(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(dashboardService.getMonthlyStats(principal.getUser()));
    }
}
