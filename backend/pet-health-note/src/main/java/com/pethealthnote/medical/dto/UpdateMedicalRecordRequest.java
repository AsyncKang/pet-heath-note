package com.pethealthnote.medical.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateMedicalRecordRequest {

    @NotNull(message = "就诊日期不能为空")
    private LocalDate visitDate;

    private String hospitalName;
    private String doctorName;
    private String diagnosis;
    private String treatment;
    private String medicine;
    private BigDecimal cost;
    private String attachmentUrls;
}


