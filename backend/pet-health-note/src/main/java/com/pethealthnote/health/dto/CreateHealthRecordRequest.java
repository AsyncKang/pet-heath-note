package com.pethealthnote.health.dto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class CreateHealthRecordRequest {

    @NotNull(message = "记录日期不能为空")
    private LocalDateTime recordDate;

    @Min(value = 0, message = "体重不能为负")
    private Double weightKg;

    @Min(value = 0, message = "体温不能为负")
    private Double temperatureC;

    private Integer appetite;
    private Integer spirit;
    private Integer stool;
    private String note;
}


