package com.pethealthnote.medical.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.pethealthnote.common.ApiResponse;
import com.pethealthnote.common.BusinessException;
import com.pethealthnote.common.PageResponse;
import com.pethealthnote.medical.dto.CreateMedicalRecordRequest;
import com.pethealthnote.medical.dto.UpdateMedicalRecordRequest;
import com.pethealthnote.medical.entity.PetMedicalRecord;
import com.pethealthnote.medical.service.PetMedicalRecordService;
import com.pethealthnote.pet.entity.Pet;
import com.pethealthnote.pet.service.PetService;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
public class PetMedicalRecordController {

    private final PetMedicalRecordService petMedicalRecordService;
    private final PetService petService;

    public PetMedicalRecordController(PetMedicalRecordService petMedicalRecordService, PetService petService) {
        this.petMedicalRecordService = petMedicalRecordService;
        this.petService = petService;
    }

    @PostMapping("/api/pets/{petId}/medical-records")
    public ApiResponse<PetMedicalRecord> createMedicalRecord(@PathVariable Long petId,
                                                             @Validated @RequestBody CreateMedicalRecordRequest request) {
        Pet pet = petService.getById(petId);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        PetMedicalRecord record = new PetMedicalRecord();
        BeanUtils.copyProperties(request, record);
        record.setPetId(petId);
        petMedicalRecordService.save(record);
        return ApiResponse.success(record);
    }

    @GetMapping("/api/pets/{petId}/medical-records")
    public ApiResponse<PageResponse<PetMedicalRecord>> listMedicalRecords(@PathVariable Long petId,
                                                                          @RequestParam(defaultValue = "1") long page,
                                                                          @RequestParam(defaultValue = "10") long size) {
        Pet pet = petService.getById(petId);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        LambdaQueryWrapper<PetMedicalRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PetMedicalRecord::getPetId, petId).orderByDesc(PetMedicalRecord::getVisitDate);
        Page<PetMedicalRecord> result = petMedicalRecordService.page(new Page<>(page, size), wrapper);
        PageResponse<PetMedicalRecord> response = new PageResponse<>(result.getTotal(), result.getCurrent(), result.getSize(), result.getRecords());
        return ApiResponse.success(response);
    }

    @GetMapping("/api/medical-records/{id}")
    public ApiResponse<PetMedicalRecord> getMedicalRecord(@PathVariable Long id) {
        PetMedicalRecord record = petMedicalRecordService.getById(id);
        if (record == null) {
            throw new BusinessException("医疗记录不存在");
        }
        return ApiResponse.success(record);
    }

    @PutMapping("/api/medical-records/{id}")
    public ApiResponse<PetMedicalRecord> updateMedicalRecord(@PathVariable Long id,
                                                             @Validated @RequestBody UpdateMedicalRecordRequest request) {
        PetMedicalRecord record = petMedicalRecordService.getById(id);
        if (record == null) {
            throw new BusinessException("医疗记录不存在");
        }
        BeanUtils.copyProperties(request, record);
        petMedicalRecordService.updateById(record);
        return ApiResponse.success(record);
    }

    @DeleteMapping("/api/medical-records/{id}")
    public ApiResponse<Void> deleteMedicalRecord(@PathVariable Long id) {
        if (!petMedicalRecordService.removeById(id)) {
            throw new BusinessException("医疗记录不存在或已删除");
        }
        return ApiResponse.success();
    }
}


