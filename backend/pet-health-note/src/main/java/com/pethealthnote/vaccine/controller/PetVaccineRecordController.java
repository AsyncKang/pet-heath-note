package com.pethealthnote.vaccine.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.pethealthnote.common.ApiResponse;
import com.pethealthnote.common.BusinessException;
import com.pethealthnote.common.PageResponse;
import com.pethealthnote.pet.entity.Pet;
import com.pethealthnote.pet.service.PetService;
import com.pethealthnote.reminder.service.ReminderAutoService;
import com.pethealthnote.vaccine.dto.CreateVaccineRecordRequest;
import com.pethealthnote.vaccine.dto.UpdateVaccineRecordRequest;
import com.pethealthnote.vaccine.entity.PetVaccineRecord;
import com.pethealthnote.vaccine.service.PetVaccineRecordService;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
public class PetVaccineRecordController {

    private final PetVaccineRecordService vaccineRecordService;
    private final PetService petService;
    private final ReminderAutoService reminderAutoService;

    public PetVaccineRecordController(PetVaccineRecordService vaccineRecordService,
                                      PetService petService,
                                      ReminderAutoService reminderAutoService) {
        this.vaccineRecordService = vaccineRecordService;
        this.petService = petService;
        this.reminderAutoService = reminderAutoService;
    }

    @PostMapping("/api/pets/{petId}/vaccine-records")
    public ApiResponse<PetVaccineRecord> createRecord(@PathVariable Long petId,
                                                      @Validated @RequestBody CreateVaccineRecordRequest request) {
        Pet pet = petService.getById(petId);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        PetVaccineRecord record = new PetVaccineRecord();
        BeanUtils.copyProperties(request, record);
        record.setPetId(petId);
        vaccineRecordService.save(record);
        reminderAutoService.syncVaccineReminder(pet, record);
        return ApiResponse.success(record);
    }

    @GetMapping("/api/pets/{petId}/vaccine-records")
    public ApiResponse<PageResponse<PetVaccineRecord>> listByPet(@PathVariable Long petId,
                                                                 @RequestParam(defaultValue = "1") long page,
                                                                 @RequestParam(defaultValue = "10") long size) {
        Pet pet = petService.getById(petId);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        LambdaQueryWrapper<PetVaccineRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PetVaccineRecord::getPetId, petId).orderByDesc(PetVaccineRecord::getInjectionDate);
        Page<PetVaccineRecord> result = vaccineRecordService.page(new Page<>(page, size), wrapper);
        PageResponse<PetVaccineRecord> response =
                new PageResponse<>(result.getTotal(), result.getCurrent(), result.getSize(), result.getRecords());
        return ApiResponse.success(response);
    }

    @GetMapping("/api/vaccine-records/{id}")
    public ApiResponse<PetVaccineRecord> getRecord(@PathVariable Long id) {
        PetVaccineRecord record = vaccineRecordService.getById(id);
        if (record == null) {
            throw new BusinessException("疫苗记录不存在");
        }
        return ApiResponse.success(record);
    }

    @PutMapping("/api/vaccine-records/{id}")
    public ApiResponse<PetVaccineRecord> updateRecord(@PathVariable Long id,
                                                      @Validated @RequestBody UpdateVaccineRecordRequest request) {
        PetVaccineRecord record = vaccineRecordService.getById(id);
        if (record == null) {
            throw new BusinessException("疫苗记录不存在");
        }
        BeanUtils.copyProperties(request, record);
        vaccineRecordService.updateById(record);
        Pet pet = petService.getById(record.getPetId());
        reminderAutoService.syncVaccineReminder(pet, record);
        return ApiResponse.success(record);
    }

    @DeleteMapping("/api/vaccine-records/{id}")
    public ApiResponse<Void> deleteRecord(@PathVariable Long id) {
        PetVaccineRecord record = vaccineRecordService.getById(id);
        if (record == null) {
            throw new BusinessException("疫苗记录不存在或已删除");
        }
        reminderAutoService.removeReminderByRecordId(record.getId());
        vaccineRecordService.removeById(id);
        return ApiResponse.success();
    }
}


