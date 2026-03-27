package com.pethealthnote.health.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.pethealthnote.common.ApiResponse;
import com.pethealthnote.common.BusinessException;
import com.pethealthnote.common.PageResponse;
import com.pethealthnote.health.dto.CreateHealthRecordRequest;
import com.pethealthnote.health.dto.UpdateHealthRecordRequest;
import com.pethealthnote.health.entity.PetHealthRecord;
import com.pethealthnote.health.service.PetHealthRecordService;
import com.pethealthnote.pet.entity.Pet;
import com.pethealthnote.pet.service.PetService;
import org.springframework.beans.BeanUtils;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
public class PetHealthRecordController {

    private final PetHealthRecordService petHealthRecordService;
    private final PetService petService;

    public PetHealthRecordController(PetHealthRecordService petHealthRecordService, PetService petService) {
        this.petHealthRecordService = petHealthRecordService;
        this.petService = petService;
    }

    @PostMapping("/api/pets/{petId}/health-records")
    public ApiResponse<PetHealthRecord> createHealthRecord(@PathVariable Long petId,
                                                           @Validated @RequestBody CreateHealthRecordRequest request,
                                                           @RequestParam(defaultValue = "false") boolean force) {
        Pet pet = petService.getById(petId);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        LambdaQueryWrapper<PetHealthRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PetHealthRecord::getPetId, petId)
                .eq(PetHealthRecord::getRecordDate, request.getRecordDate());
        PetHealthRecord existing = petHealthRecordService.getOne(wrapper, false);
        if (existing != null) {
            if (force) {
                BeanUtils.copyProperties(request, existing);
                petHealthRecordService.updateById(existing);
                return ApiResponse.success(existing);
            }
            throw new BusinessException(40901, "该时间节点已添加过健康记录");
        }
        PetHealthRecord record = new PetHealthRecord();
        BeanUtils.copyProperties(request, record);
        record.setPetId(petId);
        petHealthRecordService.save(record);
        return ApiResponse.success(record);
    }

    @GetMapping("/api/pets/{petId}/health-records")
    public ApiResponse<PageResponse<PetHealthRecord>> listHealthRecords(@PathVariable Long petId,
                                                                        @RequestParam(defaultValue = "1") long page,
                                                                        @RequestParam(defaultValue = "10") long size) {
        Pet pet = petService.getById(petId);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        LambdaQueryWrapper<PetHealthRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PetHealthRecord::getPetId, petId).orderByDesc(PetHealthRecord::getRecordDate);
        Page<PetHealthRecord> result = petHealthRecordService.page(new Page<>(page, size), wrapper);
        PageResponse<PetHealthRecord> response = new PageResponse<>(result.getTotal(), result.getCurrent(), result.getSize(), result.getRecords());
        return ApiResponse.success(response);
    }

    @GetMapping("/api/pets/{petId}/health-records/by-time")
    public ApiResponse<PetHealthRecord> getHealthRecordByTime(@PathVariable Long petId,
                                                              @RequestParam("recordDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime recordDate) {
        Pet pet = petService.getById(petId);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        LambdaQueryWrapper<PetHealthRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PetHealthRecord::getPetId, petId)
                .eq(PetHealthRecord::getRecordDate, recordDate);
        PetHealthRecord record = petHealthRecordService.getOne(wrapper, false);
        return ApiResponse.success(record);
    }

    @PutMapping("/api/health-records/{id}")
    public ApiResponse<PetHealthRecord> updateHealthRecord(@PathVariable Long id,
                                                           @Validated @RequestBody UpdateHealthRecordRequest request) {
        PetHealthRecord record = petHealthRecordService.getById(id);
        if (record == null) {
            throw new BusinessException("健康记录不存在");
        }
        BeanUtils.copyProperties(request, record);
        petHealthRecordService.updateById(record);
        return ApiResponse.success(record);
    }

    @GetMapping("/api/health-records/{id}")
    public ApiResponse<PetHealthRecord> getHealthRecord(@PathVariable Long id) {
        PetHealthRecord record = petHealthRecordService.getById(id);
        if (record == null) {
            throw new BusinessException("健康记录不存在");
        }
        return ApiResponse.success(record);
    }

    @DeleteMapping("/api/health-records/{id}")
    public ApiResponse<Void> deleteHealthRecord(@PathVariable Long id) {
        if (!petHealthRecordService.removeById(id)) {
            throw new BusinessException("健康记录不存在或已删除");
        }
        return ApiResponse.success();
    }
}


