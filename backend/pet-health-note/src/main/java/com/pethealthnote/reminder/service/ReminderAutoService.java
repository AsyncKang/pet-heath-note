package com.pethealthnote.reminder.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.pethealthnote.pet.entity.Pet;
import com.pethealthnote.reminder.entity.Reminder;
import com.pethealthnote.vaccine.entity.PetVaccineRecord;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class ReminderAutoService {

    private static final String SOURCE_TYPE_VACCINE = "VACCINE_RECORD";
    private static final String SOURCE_TYPE_DEWORM = "DEWORM_RECORD";
    private static final String REMINDER_TYPE_VACCINE = "疫苗提醒";
    private static final String REMINDER_TYPE_DEWORM = "驱虫提醒";

    private final ReminderService reminderService;

    public ReminderAutoService(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    public void syncVaccineReminder(Pet pet, PetVaccineRecord record) {
        if (pet == null || record == null) {
            return;
        }
        if (record.getNextInjectionDate() == null) {
            removeReminderByRecordId(record.getId());
            return;
        }
        ReminderDefinition definition = buildDefinition(pet, record);
        Reminder existing = reminderService.getOne(
                new LambdaQueryWrapper<Reminder>()
                        .eq(Reminder::getSourceId, record.getId())
                        .eq(Reminder::getSourceType, definition.getSourceType())
                        .last("limit 1")
        );
        if (existing == null) {
            Reminder reminder = new Reminder();
            reminder.setUserId(pet.getUserId());
            reminder.setPetId(pet.getId());
            reminder.setReminderType(definition.getReminderType());
            reminder.setTitle(definition.getTitle());
            reminder.setContent(definition.getContent());
            reminder.setRemindTime(definition.getRemindTime());
            reminder.setStatus(0);
            reminder.setSourceType(definition.getSourceType());
            reminder.setSourceId(record.getId());
            reminder.setLastNotifyDate(null);
            reminderService.save(reminder);
        } else {
            existing.setReminderType(definition.getReminderType());
            existing.setTitle(definition.getTitle());
            existing.setContent(definition.getContent());
            existing.setRemindTime(definition.getRemindTime());
            existing.setStatus(0);
            existing.setSourceType(definition.getSourceType());
            existing.setLastNotifyDate(null);
            reminderService.updateById(existing);
        }
    }

    public void removeReminderByRecordId(Long recordId) {
        if (recordId == null) {
            return;
        }
        reminderService.remove(new LambdaUpdateWrapper<Reminder>()
                .eq(Reminder::getSourceId, recordId));
    }

    private ReminderDefinition buildDefinition(Pet pet, PetVaccineRecord record) {
        boolean isDeworm = isDewormRecord(record);
        LocalDate nextDate = record.getNextInjectionDate();
        LocalDateTime remindAt = nextDate != null ? nextDate.atTime(9, 0) : LocalDateTime.now();
        String vaccineName = StringUtils.hasText(record.getVaccineName()) ? record.getVaccineName() : "该项目";
        String reminderType = isDeworm ? REMINDER_TYPE_DEWORM : REMINDER_TYPE_VACCINE;
        String sourceType = isDeworm ? SOURCE_TYPE_DEWORM : SOURCE_TYPE_VACCINE;
        String title = String.format("%s - %s", pet.getName(), reminderType);
        String content = String.format("请在%s前完成%s（%s）。", nextDate, reminderType, vaccineName);
        return new ReminderDefinition(reminderType, sourceType, title, content, remindAt);
    }

    private boolean isDewormRecord(PetVaccineRecord record) {
        String type = record.getVaccineType();
        String name = record.getVaccineName();
        return (type != null && type.contains("驱虫"))
                || (name != null && name.contains("驱虫"));
    }

    private static class ReminderDefinition {
        private final String reminderType;
        private final String sourceType;
        private final String title;
        private final String content;
        private final LocalDateTime remindTime;

        ReminderDefinition(String reminderType, String sourceType, String title, String content, LocalDateTime remindTime) {
            this.reminderType = reminderType;
            this.sourceType = sourceType;
            this.title = title;
            this.content = content;
            this.remindTime = remindTime;
        }

        public String getReminderType() {
            return reminderType;
        }

        public String getSourceType() {
            return sourceType;
        }

        public String getTitle() {
            return title;
        }

        public String getContent() {
            return content;
        }

        public LocalDateTime getRemindTime() {
            return remindTime;
        }
    }
}


