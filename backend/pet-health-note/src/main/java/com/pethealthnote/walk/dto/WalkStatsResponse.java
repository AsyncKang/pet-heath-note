package com.pethealthnote.walk.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class WalkStatsResponse {

    private BigDecimal totalDistanceKm;

    private Long totalDurationMin;
}


