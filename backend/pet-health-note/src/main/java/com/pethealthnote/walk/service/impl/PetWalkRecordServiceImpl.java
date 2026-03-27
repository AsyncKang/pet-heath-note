package com.pethealthnote.walk.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pethealthnote.walk.dto.WalkStatsResponse;
import com.pethealthnote.walk.entity.PetWalkRecord;
import com.pethealthnote.walk.mapper.PetWalkRecordMapper;
import com.pethealthnote.walk.service.PetWalkRecordService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class PetWalkRecordServiceImpl extends ServiceImpl<PetWalkRecordMapper, PetWalkRecord>
        implements PetWalkRecordService {

    @Override
    public WalkStatsResponse getWalkStats(Long petId) {
        QueryWrapper<PetWalkRecord> wrapper = new QueryWrapper<>();
        wrapper.select("COALESCE(SUM(distance_km), 0) AS total_distance_km",
                "COALESCE(SUM(duration_minutes), 0) AS total_duration_min")
                .eq("pet_id", petId)
                .eq("is_deleted", 0);
        List<Map<String, Object>> result = this.baseMapper.selectMaps(wrapper);
        BigDecimal distance = BigDecimal.ZERO;
        Long duration = 0L;
        if (!result.isEmpty()) {
            Map<String, Object> map = result.get(0);
            Object distanceObj = map.get("total_distance_km");
            Object durationObj = map.get("total_duration_min");
            if (distanceObj instanceof BigDecimal) {
                distance = (BigDecimal) distanceObj;
            } else if (distanceObj != null) {
                distance = new BigDecimal(distanceObj.toString());
            }
            if (durationObj instanceof Number) {
                duration = ((Number) durationObj).longValue();
            } else if (durationObj != null) {
                duration = Long.parseLong(durationObj.toString());
            }
        }
        return new WalkStatsResponse(distance, duration);
    }
}


