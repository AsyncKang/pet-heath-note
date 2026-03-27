package com.pethealthnote.reminder.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("reminder")
public class Reminder {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long petId;
    private String reminderType;
    private String title;
    private String content;
    private LocalDateTime remindTime;
    private Integer status;
    private String sourceType;
    private Long sourceId;
    private LocalDate lastNotifyDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField("is_deleted")
    private Integer deleted;
}


