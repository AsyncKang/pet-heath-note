package com.pethealthnote.favorite.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("favorite_place")
public class FavoritePlace {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private String name;

    /**
     * 类型：HOSPITAL/SHOP/PARK/OTHER
     */
    private String placeType;

    private String address;

    private String contact;

    private String remark;

    private Double latitude;

    private Double longitude;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @TableField("is_deleted")
    private Integer deleted;
}


