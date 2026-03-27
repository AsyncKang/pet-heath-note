package com.pethealthnote.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String openid;
    private String unionid;
    private String nickname;
    private String avatarUrl;
    private String mobile;
    private Integer gender;
    private Boolean notifyVaccine;
    private Boolean notifyDeworm;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @TableField("is_deleted")
    private Integer deleted;
}


