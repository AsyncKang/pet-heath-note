package com.pethealthnote.health.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("pet_health_record")
public class PetHealthRecord {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long petId;
    private LocalDateTime recordDate;
    private Double weightKg;
    private Double temperatureC;
    private Integer appetite;
    private Integer spirit;
    private Integer stool;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField("is_deleted")
    private Integer deleted;
}


