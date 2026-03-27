package com.pethealthnote.user.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pethealthnote.user.entity.User;
import com.pethealthnote.user.mapper.UserMapper;
import com.pethealthnote.user.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
}


