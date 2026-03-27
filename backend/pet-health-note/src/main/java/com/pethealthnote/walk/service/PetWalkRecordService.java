package com.pethealthnote.walk.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.pethealthnote.walk.dto.WalkStatsResponse;
import com.pethealthnote.walk.entity.PetWalkRecord;

public interface PetWalkRecordService extends IService<PetWalkRecord> {

    WalkStatsResponse getWalkStats(Long petId);
}


