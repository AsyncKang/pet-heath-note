package com.pethealthnote.reminder.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class UpdateReminderStatusRequest {

    @NotNull(message = "状态不能为空")
    private Integer status;
}


