package com.pethealthnote.walk.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("pet_walk_record")
public class PetWalkRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long petId;

    private LocalDate walkDate;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer durationMinutes;

    private BigDecimal distanceKm;

    private String location;

    private String weatherDesc;

    private String mood;

    private String remark;

    private String pathPoints;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @TableField("is_deleted")
    private Integer deleted;
}


