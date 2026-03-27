package com.pethealthnote.vaccine.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class UpdateVaccineRecordRequest {

    @NotBlank(message = "疫苗名称不能为空")
    private String vaccineName;

    private String vaccineType;
    private String dose;

    @NotNull(message = "接种日期不能为空")
    private LocalDate injectionDate;

    private LocalDate nextInjectionDate;
    private String hospitalName;
    private String remark;
}


