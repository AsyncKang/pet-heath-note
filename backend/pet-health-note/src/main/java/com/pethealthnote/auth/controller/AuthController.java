package com.pethealthnote.auth.controller;

import com.pethealthnote.auth.dto.LoginRequest;
import com.pethealthnote.auth.dto.LoginResponse;
import com.pethealthnote.auth.dto.WeChatSessionResponse;
import com.pethealthnote.auth.service.WeChatAuthService;
import com.pethealthnote.common.ApiResponse;
import com.pethealthnote.user.entity.User;
import com.pethealthnote.user.service.UserService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final WeChatAuthService weChatAuthService;

    public AuthController(UserService userService, WeChatAuthService weChatAuthService) {
        this.userService = userService;
        this.weChatAuthService = weChatAuthService;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Validated @RequestBody LoginRequest request) {
        WeChatSessionResponse sessionResponse = weChatAuthService.code2Session(request.getCode());
        String openId = sessionResponse.getOpenId();
        User user = userService.lambdaQuery().eq(User::getOpenid, openId).one();
        if (user == null) {
            user = new User();
            user.setOpenid(openId);
            user.setUnionid(sessionResponse.getUnionId());
            user.setNickname(request.getNickname() != null && !request.getNickname().isEmpty() 
                ? request.getNickname() : "宠物主人");
            if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
                user.setAvatarUrl(request.getAvatarUrl());
            }
            user.setGender(request.getGender() != null ? request.getGender() : 0);
            user.setNotifyVaccine(Boolean.TRUE);
            user.setNotifyDeworm(Boolean.TRUE);
            userService.save(user);
        } else {
            // 更新用户信息：如果前端提供了新的昵称或头像，则更新
            if (request.getNickname() != null && !request.getNickname().isEmpty()) {
                user.setNickname(request.getNickname());
            }
            if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
                user.setAvatarUrl(request.getAvatarUrl());
            }
            if (request.getGender() != null) {
                user.setGender(request.getGender());
            }
            if (sessionResponse.getUnionId() != null && !sessionResponse.getUnionId().isEmpty()) {
                user.setUnionid(sessionResponse.getUnionId());
            }
            if (user.getNotifyVaccine() == null) {
                user.setNotifyVaccine(Boolean.TRUE);
            }
            if (user.getNotifyDeworm() == null) {
                user.setNotifyDeworm(Boolean.TRUE);
            }
            userService.updateById(user);
        }
        String token = "token-" + user.getId() + "-" + System.currentTimeMillis();
        return ApiResponse.success(new LoginResponse(token, user));
    }
}
