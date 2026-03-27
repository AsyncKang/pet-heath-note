package com.pethealthnote.user.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class CreateUserRequest {

    @NotBlank(message = "openid不能为空")
    private String openid;

    private String unionid;

    @NotBlank(message = "昵称不能为空")
    private String nickname;

    private String avatarUrl;

    private String mobile;

    private Integer gender;

    private Boolean notifyVaccine = Boolean.TRUE;

    private Boolean notifyDeworm = Boolean.TRUE;
}


