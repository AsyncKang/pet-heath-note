package com.pethealthnote.walk.dto;

import lombok.Data;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateWalkRecordRequest {

    @NotNull(message = "遛弯日期不能为空")
    private LocalDate walkDate;

    @NotNull(message = "开始时间不能为空")
    private LocalDateTime startTime;

    @NotNull(message = "结束时间不能为空")
    private LocalDateTime endTime;

    @NotNull(message = "时长不能为空")
    @Min(value = 1, message = "时长需大于0")
    private Integer durationMinutes;

    @NotNull(message = "距离不能为空")
    @DecimalMin(value = "0.1", message = "距离需大于0")
    private BigDecimal distanceKm;

    private String location;

    private String weatherDesc;

    private String mood;

    private String remark;

    @NotNull(message = "轨迹点不能为空")
    private List<WalkPathPoint> pathPoints;
}


