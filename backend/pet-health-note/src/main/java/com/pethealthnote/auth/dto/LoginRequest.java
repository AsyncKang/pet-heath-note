package com.pethealthnote.auth.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class LoginRequest {

    @NotBlank(message = "code不能为空")
    private String code;

    private String nickname;

    private String avatarUrl;

    private Integer gender;
}


