package com.pethealthnote.auth.dto;

import com.pethealthnote.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private User user;
}


