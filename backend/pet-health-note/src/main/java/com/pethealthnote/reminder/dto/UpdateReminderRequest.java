package com.pethealthnote.reminder.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class UpdateReminderRequest {

    @NotBlank(message = "提醒类型不能为空")
    private String reminderType;

    @NotBlank(message = "标题不能为空")
    private String title;

    private String content;

    @NotNull(message = "提醒时间不能为空")
    private LocalDateTime remindTime;

    private String sourceType;

    private Long sourceId;
}


