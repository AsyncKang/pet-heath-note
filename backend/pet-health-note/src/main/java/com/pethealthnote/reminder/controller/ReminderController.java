package com.pethealthnote.reminder.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.pethealthnote.common.ApiResponse;
import com.pethealthnote.common.BusinessException;
import com.pethealthnote.common.PageResponse;
import com.pethealthnote.pet.entity.Pet;
import com.pethealthnote.pet.service.PetService;
import com.pethealthnote.reminder.dto.CreateReminderRequest;
import com.pethealthnote.reminder.dto.UpdateReminderRequest;
import com.pethealthnote.reminder.dto.UpdateReminderStatusRequest;
import com.pethealthnote.reminder.entity.Reminder;
import com.pethealthnote.reminder.service.ReminderService;
import com.pethealthnote.user.entity.User;
import com.pethealthnote.user.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderService reminderService;
    private final UserService userService;
    private final PetService petService;

    public ReminderController(ReminderService reminderService,
                              UserService userService,
                              PetService petService) {
        this.reminderService = reminderService;
        this.userService = userService;
        this.petService = petService;
    }

    @PostMapping
    public ApiResponse<Reminder> createReminder(@Validated @RequestBody CreateReminderRequest request) {
        User user = userService.getById(request.getUserId());
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        if (request.getPetId() != null) {
            Pet pet = petService.getById(request.getPetId());
            if (pet == null) {
                throw new BusinessException("绑定的宠物不存在");
            }
        }
        Reminder reminder = new Reminder();
        BeanUtils.copyProperties(request, reminder);
        reminder.setStatus(0);
        reminderService.save(reminder);
        return ApiResponse.success(reminder);
    }

    @GetMapping
    public ApiResponse<PageResponse<Reminder>> listReminders(@RequestParam(defaultValue = "1") long page,
                                                             @RequestParam(defaultValue = "10") long size,
                                                             @RequestParam(required = false) Long userId,
                                                             @RequestParam(required = false) Long petId,
                                                             @RequestParam(required = false) String reminderType,
                                                             @RequestParam(required = false) Integer status) {
        LambdaQueryWrapper<Reminder> wrapper = new LambdaQueryWrapper<>();
        if (userId != null) {
            wrapper.eq(Reminder::getUserId, userId);
        }
        if (petId != null) {
            wrapper.eq(Reminder::getPetId, petId);
        }
        if (reminderType != null && !reminderType.isEmpty()) {
            wrapper.eq(Reminder::getReminderType, reminderType);
        }
        if (status != null) {
            wrapper.eq(Reminder::getStatus, status);
        }
        wrapper.orderByAsc(Reminder::getRemindTime);
        Page<Reminder> result = reminderService.page(new Page<>(page, size), wrapper);
        PageResponse<Reminder> response =
                new PageResponse<>(result.getTotal(), result.getCurrent(), result.getSize(), result.getRecords());
        return ApiResponse.success(response);
    }

    @GetMapping("/{id}")
    public ApiResponse<Reminder> getReminder(@PathVariable Long id) {
        Reminder reminder = reminderService.getById(id);
        if (reminder == null) {
            throw new BusinessException("提醒不存在");
        }
        return ApiResponse.success(reminder);
    }

    @PutMapping("/{id}")
    public ApiResponse<Reminder> updateReminder(@PathVariable Long id,
                                                @Validated @RequestBody UpdateReminderRequest request) {
        Reminder reminder = reminderService.getById(id);
        if (reminder == null) {
            throw new BusinessException("提醒不存在");
        }
        BeanUtils.copyProperties(request, reminder);
        reminderService.updateById(reminder);
        return ApiResponse.success(reminder);
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Reminder> updateReminderStatus(@PathVariable Long id,
                                                      @Validated @RequestBody UpdateReminderStatusRequest request) {
        Reminder reminder = reminderService.getById(id);
        if (reminder == null) {
            throw new BusinessException("提醒不存在");
        }
        reminder.setStatus(request.getStatus());
        reminderService.updateById(reminder);
        return ApiResponse.success(reminder);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteReminder(@PathVariable Long id) {
        if (!reminderService.removeById(id)) {
            throw new BusinessException("提醒不存在或已删除");
        }
        return ApiResponse.success();
    }
}


