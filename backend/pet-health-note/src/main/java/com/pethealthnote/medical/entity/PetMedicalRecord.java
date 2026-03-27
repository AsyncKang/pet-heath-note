package com.pethealthnote.medical.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("pet_medical_record")
public class PetMedicalRecord {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long petId;
    private LocalDate visitDate;
    private String hospitalName;
    private String doctorName;
    private String diagnosis;
    private String treatment;
    private String medicine;
    private BigDecimal cost;
    private String attachmentUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField("is_deleted")
    private Integer deleted;
}


