package com.pethealthnote.pet.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.pethealthnote.common.ApiResponse;
import com.pethealthnote.common.BusinessException;
import com.pethealthnote.common.PageResponse;
import com.pethealthnote.pet.dto.CreatePetRequest;
import com.pethealthnote.pet.dto.UpdatePetRequest;
import com.pethealthnote.pet.entity.Pet;
import com.pethealthnote.pet.service.PetService;
import com.pethealthnote.user.entity.User;
import com.pethealthnote.user.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;
    private final UserService userService;

    public PetController(PetService petService, UserService userService) {
        this.petService = petService;
        this.userService = userService;
    }

    @PostMapping
    public ApiResponse<Pet> createPet(@Validated @RequestBody CreatePetRequest request) {
        User user = userService.getById(request.getUserId());
        if (user == null) {
            throw new BusinessException("所属用户不存在");
        }
        Pet pet = new Pet();
        BeanUtils.copyProperties(request, pet);
        petService.save(pet);
        return ApiResponse.success(pet);
    }

    @PutMapping("/{id}")
    public ApiResponse<Pet> updatePet(@PathVariable Long id,
                                      @Validated @RequestBody UpdatePetRequest request) {
        Pet pet = petService.getById(id);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        BeanUtils.copyProperties(request, pet);
        petService.updateById(pet);
        return ApiResponse.success(pet);
    }

    @GetMapping("/{id}")
    public ApiResponse<Pet> getPet(@PathVariable Long id) {
        Pet pet = petService.getById(id);
        if (pet == null) {
            throw new BusinessException("宠物不存在");
        }
        return ApiResponse.success(pet);
    }

    @GetMapping
    public ApiResponse<PageResponse<Pet>> listPets(@RequestParam(defaultValue = "1") long page,
                                                   @RequestParam(defaultValue = "10") long size,
                                                   @RequestParam(required = false) Long userId,
                                                   @RequestParam(required = false) String name) {
        LambdaQueryWrapper<Pet> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(Pet::getUserId, userId);
        }
        if (name != null && !name.isEmpty()) {
            wrapper.like(Pet::getName, name);
        }
        Page<Pet> result = petService.page(new Page<>(page, size), wrapper);
        PageResponse<Pet> response = new PageResponse<>(result.getTotal(), result.getCurrent(), result.getSize(), result.getRecords());
        return ApiResponse.success(response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePet(@PathVariable Long id) {
        if (!petService.removeById(id)) {
            throw new BusinessException("宠物不存在或已删除");
        }
        return ApiResponse.success();
    }
}


