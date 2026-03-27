package com.pethealthnote.user.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {

    private String nickname;
    private String avatarUrl;
    private String mobile;
    private Integer gender;
    private Boolean notifyVaccine;
    private Boolean notifyDeworm;
}


