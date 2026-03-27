package com.pethealthnote.reminder.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pethealthnote.auth.service.WeChatAccessTokenService;
import com.pethealthnote.auth.service.WeChatMiniAppProperties;
import com.pethealthnote.common.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class WeChatMessageService {

    private static final Logger log = LoggerFactory.getLogger(WeChatMessageService.class);
    private static final String SUBSCRIBE_SEND_URL =
            "https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=%s";

    private final WeChatAccessTokenService accessTokenService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WeChatMiniAppProperties properties;

    public WeChatMessageService(WeChatAccessTokenService accessTokenService,
                                WeChatMiniAppProperties properties) {
        this.accessTokenService = accessTokenService;
        this.properties = properties;
    }

    public void sendSubscribeMessage(String openId,
                                     String templateId,
                                     String page,
                                     Map<String, Object> data) {
        if (!StringUtils.hasText(openId) || !StringUtils.hasText(templateId)) {
            log.warn("[wechat] skip subscribe message, missing openId/templateId");
            return;
        }
        try {
            String accessToken = accessTokenService.getAccessToken();
            String url = String.format(SUBSCRIBE_SEND_URL, accessToken);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> payload = new HashMap<>();
            payload.put("touser", openId);
            payload.put("template_id", templateId);
            payload.put("page", StringUtils.hasText(page) ? page : "pages/index/index");
            payload.put("data", data);
            String body = objectMapper.writeValueAsString(payload);
            String response = restTemplate.postForObject(url, new HttpEntity<>(body, headers), String.class);
            log.info("[wechat] send subscribe message, template={}, openId={}, resp={}", templateId, openId, response);
        } catch (Exception ex) {
            log.error("[wechat] send subscribe message failed", ex);
            throw new BusinessException("发送微信提醒失败：" + ex.getMessage());
        }
    }

    public String getVaccineTemplateId() {
        return properties.getTemplates().getVaccineReminderTemplateId();
    }

    public String getDewormTemplateId() {
        return properties.getTemplates().getDewormReminderTemplateId();
    }
}


