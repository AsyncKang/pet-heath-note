package com.pethealthnote.vaccine.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("pet_vaccine_record")
public class PetVaccineRecord {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long petId;
    private String vaccineName;
    private String vaccineType;
    private String dose;
    private LocalDate injectionDate;
    private LocalDate nextInjectionDate;
    private String hospitalName;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField("is_deleted")
    private Integer deleted;
}


