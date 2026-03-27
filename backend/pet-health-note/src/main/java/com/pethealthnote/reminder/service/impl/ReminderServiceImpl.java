package com.pethealthnote.reminder.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.pethealthnote.reminder.entity.Reminder;
import com.pethealthnote.reminder.mapper.ReminderMapper;
import com.pethealthnote.reminder.service.ReminderService;
import org.springframework.stereotype.Service;

@Service
public class ReminderServiceImpl extends ServiceImpl<ReminderMapper, Reminder> implements ReminderService {
}


