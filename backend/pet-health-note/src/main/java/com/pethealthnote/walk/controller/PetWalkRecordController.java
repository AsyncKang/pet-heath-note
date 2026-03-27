package com.pethealthnote.walk.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.pethealthnote.common.ApiResponse;
import com.pethealthnote.common.BusinessException;
import com.pethealthnote.common.PageResponse;
import com.pethealthnote.pet.entity.Pet;
import com.pethealthnote.pet.service.PetService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pethealthnote.walk.dto.CreateWalkRecordRequest;
import com.pethealthnote.walk.dto.WalkStatsResponse;
import com.pethealthnote.walk.entity.PetWalkRecord;
import com.pethealthnote.walk.service.PetWalkRecordService;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
public class PetWalkRecordController {

    private final PetWalkRecordService walkRecordService;
    private final PetService petService;
    private final ObjectMapper objectMapper;

    public PetWalkRecordController(PetWalkRecordService walkRecordService,
                                   PetService petService,
                                   ObjectMapper objectMapper) {
        this.walkRecordService = walkRecordService;
        this.petService = petService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/api/pets/{petId}/walk-records")
    public ApiResponse<PetWalkRecord> createWalkRecord(@PathVariable Long petId,
                                                       @Validated @RequestBody CreateWalkRecordRequest request) {
        Pet pet = petService.getById(petId);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        PetWalkRecord record = new PetWalkRecord();
        BeanUtils.copyProperties(request, record);
        record.setWeatherDesc(request.getWeatherDesc());
        record.setEndTime(request.getEndTime());
        try {
            record.setPathPoints(objectMapper.writeValueAsString(request.getPathPoints()));
        } catch (JsonProcessingException e) {
            throw new BusinessException("轨迹数据格式错误");
        }
        record.setPetId(petId);
        walkRecordService.save(record);
        return ApiResponse.success(record);
    }

    @GetMapping("/api/pets/{petId}/walk-records")
    public ApiResponse<PageResponse<PetWalkRecord>> listWalkRecords(@PathVariable Long petId,
                                                                    @RequestParam(defaultValue = "1") long page,
                                                                    @RequestParam(defaultValue = "10") long size) {
        Pet pet = petService.getById(petId);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        LambdaQueryWrapper<PetWalkRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PetWalkRecord::getPetId, petId)
                .orderByDesc(PetWalkRecord::getWalkDate)
                .orderByDesc(PetWalkRecord::getStartTime);
        Page<PetWalkRecord> result = walkRecordService.page(new Page<>(page, size), wrapper);
        PageResponse<PetWalkRecord> response =
                new PageResponse<>(result.getTotal(), result.getCurrent(), result.getSize(), result.getRecords());
        return ApiResponse.success(response);
    }

    @GetMapping("/api/pets/{petId}/walk-records/stats")
    public ApiResponse<WalkStatsResponse> getStats(@PathVariable Long petId) {
        Pet pet = petService.getById(petId);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        return ApiResponse.success(walkRecordService.getWalkStats(petId));
    }

    @GetMapping("/api/walk-records/{id}")
    public ApiResponse<PetWalkRecord> getWalkRecord(@PathVariable Long id) {
        PetWalkRecord record = walkRecordService.getById(id);
        if (record == null) {
            throw new BusinessException("遛弯记录不存在");
        }
        return ApiResponse.success(record);
    }
}


