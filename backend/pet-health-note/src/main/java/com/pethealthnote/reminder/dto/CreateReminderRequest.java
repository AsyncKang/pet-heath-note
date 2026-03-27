package com.pethealthnote.reminder.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class CreateReminderRequest {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    private Long petId;

    @NotBlank(message = "提醒类型不能为空")
    private String reminderType;

    @NotBlank(message = "标题不能为空")
    private String title;

    private String content;

    @NotNull(message = "提醒时间不能为空")
    private LocalDateTime remindTime;

    /** 来源业务类型，如 VACCINE_RECORD、DEWORM_RECORD，可选 */
    private String sourceType;

    /** 来源业务ID，可选 */
    private Long sourceId;
}


