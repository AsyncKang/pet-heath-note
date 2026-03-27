package com.pethealthnote.pet.dto;

import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class CreatePetRequest {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotBlank(message = "宠物名称不能为空")
    private String name;

    private String species;
    private String breed;
    private Integer gender;
    private LocalDate birthDate;

    @Min(value = 0, message = "体重不能为负")
    private Double weightKg;

    private String avatarUrl;
    private String remark;
}


