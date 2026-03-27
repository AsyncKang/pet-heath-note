package com.pethealthnote.pet.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("pet")
public class Pet {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String name;
    private String species;
    private String breed;
    private Integer gender;
    private LocalDate birthDate;
    private Double weightKg;
    private String avatarUrl;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField("is_deleted")
    private Integer deleted;
}


