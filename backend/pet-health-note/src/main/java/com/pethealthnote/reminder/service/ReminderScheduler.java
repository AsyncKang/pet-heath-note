package com.pethealthnote.reminder.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.pethealthnote.pet.entity.Pet;
import com.pethealthnote.pet.service.PetService;
import com.pethealthnote.reminder.entity.Reminder;
import com.pethealthnote.user.entity.User;
import com.pethealthnote.user.service.UserService;
import com.pethealthnote.vaccine.entity.PetVaccineRecord;
import com.pethealthnote.vaccine.service.PetVaccineRecordService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);
    private static final Set<Long> NOTIFY_DAYS = new HashSet<>(Arrays.asList(3L, 1L, 0L));
    private static final DateTimeFormatter FRIENDLY_DATE = DateTimeFormatter.ofPattern("M月d日");
    private static final String SOURCE_TYPE_VACCINE = "VACCINE_RECORD";
    private static final String SOURCE_TYPE_DEWORM = "DEWORM_RECORD";

    private final ReminderService reminderService;
    private final PetVaccineRecordService vaccineRecordService;
    private final PetService petService;
    private final UserService userService;
    private final WeChatMessageService weChatMessageService;

    public ReminderScheduler(ReminderService reminderService,
                             PetVaccineRecordService vaccineRecordService,
                             PetService petService,
                             UserService userService,
                             WeChatMessageService weChatMessageService) {
        this.reminderService = reminderService;
        this.vaccineRecordService = vaccineRecordService;
        this.petService = petService;
        this.userService = userService;
        this.weChatMessageService = weChatMessageService;
    }

    /**
     * 每日 9 点推送即将到期的疫苗/驱虫提醒。
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void pushReminders() {
        LocalDate today = LocalDate.now();
        List<Reminder> reminders = reminderService.list(new LambdaQueryWrapper<Reminder>()
                .eq(Reminder::getStatus, 0)
                .in(Reminder::getSourceType, SOURCE_TYPE_VACCINE, SOURCE_TYPE_DEWORM));
        if (CollectionUtils.isEmpty(reminders)) {
            return;
        }
        reminders.forEach(reminder -> handleReminder(reminder, today));
    }

    private void handleReminder(Reminder reminder, LocalDate today) {
        if (reminder.getSourceId() == null) {
            return;
        }
        PetVaccineRecord record = vaccineRecordService.getById(reminder.getSourceId());
        if (record == null || record.getNextInjectionDate() == null) {
            return;
        }
        long diff = ChronoUnit.DAYS.between(today, record.getNextInjectionDate());
        if (!NOTIFY_DAYS.contains(diff)) {
            return;
        }
        if (today.equals(reminder.getLastNotifyDate())) {
            return;
        }
        User user = userService.getById(reminder.getUserId());
        if (user == null) {
            return;
        }
        boolean isDeworm = SOURCE_TYPE_DEWORM.equals(reminder.getSourceType());
        if (!isDeworm && Boolean.FALSE.equals(user.getNotifyVaccine())) {
            return;
        }
        if (isDeworm && Boolean.FALSE.equals(user.getNotifyDeworm())) {
            return;
        }
        Pet pet = reminder.getPetId() != null ? petService.getById(reminder.getPetId()) : null;
        if (pet == null) {
            return;
        }
        String templateId = isDeworm
                ? weChatMessageService.getDewormTemplateId()
                : weChatMessageService.getVaccineTemplateId();
        if (templateId == null || templateId.isEmpty()) {
            log.warn("[reminder] skip send, templateId missing for type {}", reminder.getSourceType());
            return;
        }
        String page = String.format("/pages/pet-detail/pet-detail?petId=%s", pet.getId());
        Map<String, Object> data = buildTemplateData(pet, record, isDeworm);
        try {
            weChatMessageService.sendSubscribeMessage(user.getOpenid(), templateId, page, data);
            reminder.setLastNotifyDate(today);
            reminderService.updateById(reminder);
        } catch (Exception ex) {
            log.error("[reminder] send subscribe message failed, reminderId={}", reminder.getId(), ex);
        }
    }

    private Map<String, Object> buildTemplateData(Pet pet,
                                                  PetVaccineRecord record,
                                                  boolean isDeworm) {
        String petName = pet.getName();
        String vaccineName = record.getVaccineName();
        String nextDateText = record.getNextInjectionDate().format(FRIENDLY_DATE);
        String title = isDeworm ? "驱虫到期提醒" : "疫苗到期提醒";
        String body = isDeworm
                ? String.format("您的宠物 %s 的 %s 驱虫即将到期（下次驱虫日期：%s）", petName, record.getVaccineType(), nextDateText)
                : String.format("您的宠物 %s 的 %s 即将到期（下次接种日期：%s）", petName, vaccineName, nextDateText);
        Map<String, Object> data = new HashMap<>();
        data.put("name6", singletonValue(petName));
        data.put("thing1", singletonValue(isDeworm ? record.getVaccineType() : vaccineName));
        data.put("thing2", singletonValue(record.getNextInjectionDate().toString()));
        String summary = isDeworm ? "请及时安排驱虫" : "请及时安排接种";
        data.put("thing5", singletonValue(summary));
        return data;
    }

    private Map<String, String> singletonValue(String value) {
        Map<String, String> map = new HashMap<>();
        map.put("value", value);
        return map;
    }
}


