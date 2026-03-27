package com.pethealthnote.favorite.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;

@Data
public class UpdateFavoritePlaceRequest {

    @NotBlank(message = "地点名称不能为空")
    private String name;

    @NotBlank(message = "地点类型不能为空")
    private String placeType;

    @NotBlank(message = "地址不能为空")
    private String address;

    @Pattern(regexp = "^[0-9+\\-]*$", message = "联系方式格式不正确")
    private String contact;

    private String remark;

    private Double latitude;

    private Double longitude;
}


