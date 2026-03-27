package com.pethealthnote.user.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.pethealthnote.common.ApiResponse;
import com.pethealthnote.common.BusinessException;
import com.pethealthnote.common.PageResponse;
import com.pethealthnote.user.dto.CreateUserRequest;
import com.pethealthnote.user.dto.UpdateUserRequest;
import com.pethealthnote.user.entity.User;
import com.pethealthnote.user.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ApiResponse<User> createUser(@Validated @RequestBody CreateUserRequest request) {
        User user = new User();
        BeanUtils.copyProperties(request, user);
        userService.save(user);
        return ApiResponse.success(user);
    }

    @PutMapping("/{id}")
    public ApiResponse<User> updateUser(@PathVariable Long id,
                                        @Validated @RequestBody UpdateUserRequest request) {
        User user = userService.getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (request.getNickname() != null) {
            user.setNickname(request.getNickname());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getMobile() != null) {
            user.setMobile(request.getMobile());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        if (request.getNotifyVaccine() != null) {
            user.setNotifyVaccine(request.getNotifyVaccine());
        }
        if (request.getNotifyDeworm() != null) {
            user.setNotifyDeworm(request.getNotifyDeworm());
        }
        userService.updateById(user);
        return ApiResponse.success(user);
    }

    @GetMapping("/{id}")
    public ApiResponse<User> getUser(@PathVariable Long id) {
        User user = userService.getById(id);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return ApiResponse.success(user);
    }

    @GetMapping
    public ApiResponse<PageResponse<User>> listUsers(@RequestParam(defaultValue = "1") long page,
                                                     @RequestParam(defaultValue = "10") long size,
                                                     @RequestParam(required = false) String nickname) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (nickname != null && !nickname.isEmpty()) {
            wrapper.like(User::getNickname, nickname);
        }
        Page<User> result = userService.page(new Page<>(page, size), wrapper);
        PageResponse<User> response = new PageResponse<>(result.getTotal(), result.getCurrent(), result.getSize(), result.getRecords());
        return ApiResponse.success(response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        if (!userService.removeById(id)) {
            throw new BusinessException("用户不存在或已删除");
        }
        return ApiResponse.success();
    }
}


