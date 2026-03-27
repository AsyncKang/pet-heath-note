package com.pethealthnote.favorite.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.pethealthnote.common.ApiResponse;
import com.pethealthnote.common.BusinessException;
import com.pethealthnote.common.PageResponse;
import com.pethealthnote.favorite.dto.CreateFavoritePlaceRequest;
import com.pethealthnote.favorite.dto.UpdateFavoritePlaceRequest;
import com.pethealthnote.favorite.entity.FavoritePlace;
import com.pethealthnote.favorite.service.FavoritePlaceService;
import com.pethealthnote.user.entity.User;
import com.pethealthnote.user.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
public class FavoritePlaceController {

    private final FavoritePlaceService favoritePlaceService;
    private final UserService userService;

    public FavoritePlaceController(FavoritePlaceService favoritePlaceService,
                                   UserService userService) {
        this.favoritePlaceService = favoritePlaceService;
        this.userService = userService;
    }

    @GetMapping("/api/users/{userId}/favorite-places")
    public ApiResponse<PageResponse<FavoritePlace>> listFavoritePlaces(@PathVariable Long userId,
                                                                       @RequestParam(defaultValue = "1") long page,
                                                                       @RequestParam(defaultValue = "10") long size,
                                                                       @RequestParam(required = false) String placeType) {
        User user = userService.getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        LambdaQueryWrapper<FavoritePlace> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(FavoritePlace::getUserId, userId)
                .orderByDesc(FavoritePlace::getUpdatedAt);
        if (placeType != null && !"ALL".equalsIgnoreCase(placeType)) {
            wrapper.eq(FavoritePlace::getPlaceType, placeType);
        }
        Page<FavoritePlace> result = favoritePlaceService.page(new Page<>(page, size), wrapper);
        PageResponse<FavoritePlace> response =
                new PageResponse<>(result.getTotal(), result.getCurrent(), result.getSize(), result.getRecords());
        return ApiResponse.success(response);
    }

    @PostMapping("/api/users/{userId}/favorite-places")
    public ApiResponse<FavoritePlace> createFavoritePlace(@PathVariable Long userId,
                                                          @Validated @RequestBody CreateFavoritePlaceRequest request) {
        User user = userService.getById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        FavoritePlace place = new FavoritePlace();
        BeanUtils.copyProperties(request, place);
        place.setUserId(userId);
        favoritePlaceService.save(place);
        return ApiResponse.success(place);
    }

    @GetMapping("/api/favorite-places/{id}")
    public ApiResponse<FavoritePlace> getFavoritePlace(@PathVariable Long id) {
        FavoritePlace place = favoritePlaceService.getById(id);
        if (place == null) {
            throw new BusinessException("收藏地点不存在");
        }
        return ApiResponse.success(place);
    }

    @PutMapping("/api/favorite-places/{id}")
    public ApiResponse<FavoritePlace> updateFavoritePlace(@PathVariable Long id,
                                                          @Validated @RequestBody UpdateFavoritePlaceRequest request) {
        FavoritePlace place = favoritePlaceService.getById(id);
        if (place == null) {
            throw new BusinessException("收藏地点不存在");
        }
        BeanUtils.copyProperties(request, place);
        favoritePlaceService.updateById(place);
        return ApiResponse.success(place);
    }

    @DeleteMapping("/api/favorite-places/{id}")
    public ApiResponse<Void> deleteFavoritePlace(@PathVariable Long id) {
        FavoritePlace place = favoritePlaceService.getById(id);
        if (place == null) {
            throw new BusinessException("收藏地点不存在");
        }
        favoritePlaceService.removeById(id);
        return ApiResponse.success();
    }
}


