package com.pethealthnote.auth.service;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "wechat.miniapp")
@Data
public class WeChatMiniAppProperties {

    /**
     * 小程序 AppId
     */
    private String appId;

    /**
     * 小程序 AppSecret
     */
    private String secret;

    /**
     * 微信 code2session grant_type，默认 authorization_code
     */
    private String grantType = "authorization_code";

    /**
     * 订阅消息模板配置
     */
    private Templates templates = new Templates();

    @Data
    public static class Templates {
        /**
         * 疫苗提醒模板 ID
         */
        private String vaccineReminderTemplateId;

        /**
         * 驱虫提醒模板 ID
         */
        private String dewormReminderTemplateId;
    }
}


