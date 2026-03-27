package com.pethealthnote.favorite.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pethealthnote.favorite.entity.FavoritePlace;
import com.pethealthnote.favorite.mapper.FavoritePlaceMapper;
import com.pethealthnote.favorite.service.FavoritePlaceService;
import org.springframework.stereotype.Service;

@Service
public class FavoritePlaceServiceImpl extends ServiceImpl<FavoritePlaceMapper, FavoritePlace>
        implements FavoritePlaceService {
}


