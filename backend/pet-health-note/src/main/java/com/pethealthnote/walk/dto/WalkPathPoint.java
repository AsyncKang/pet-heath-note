package com.pethealthnote.walk.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WalkPathPoint {

    @NotNull(message = "纬度不能为空")
    private BigDecimal latitude;

    @NotNull(message = "经度不能为空")
    private BigDecimal longitude;

    @NotNull(message = "时间戳不能为空")
    private LocalDateTime timestamp;
}


