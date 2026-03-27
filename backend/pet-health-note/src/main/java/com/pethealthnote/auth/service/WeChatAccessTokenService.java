package com.pethealthnote.auth.service;

import com.pethealthnote.auth.dto.WeChatAccessTokenResponse;
import com.pethealthnote.common.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;

@Service
public class WeChatAccessTokenService {

    private static final Logger log = LoggerFactory.getLogger(WeChatAccessTokenService.class);
    private static final String TOKEN_URL =
            "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s";

    private final WeChatMiniAppProperties properties;
    private final RestTemplate restTemplate = new RestTemplate();

    private String cachedToken;
    private Instant expireAt = Instant.EPOCH;

    public WeChatAccessTokenService(WeChatMiniAppProperties properties) {
        this.properties = properties;
    }

    public synchronized String getAccessToken() {
        if (StringUtils.hasText(cachedToken) && Instant.now().isBefore(expireAt.minusSeconds(60))) {
            return cachedToken;
        }
        if (!StringUtils.hasText(properties.getAppId()) || !StringUtils.hasText(properties.getSecret())) {
            throw new BusinessException("未配置微信小程序的 appId / secret，无法获取 access_token");
        }
        String url = String.format(TOKEN_URL, properties.getAppId(), properties.getSecret());
        WeChatAccessTokenResponse response = restTemplate.getForObject(url, WeChatAccessTokenResponse.class);
        if (response == null) {
            throw new BusinessException("获取微信 access_token 失败：未返回内容");
        }
        if (response.getErrCode() != null && response.getErrCode() != 0) {
            throw new BusinessException(
                    String.format("获取微信 access_token 失败：%s(%s)", response.getErrMsg(), response.getErrCode()));
        }
        cachedToken = response.getAccessToken();
        long expiresIn = response.getExpiresIn() != null ? response.getExpiresIn() : 3600;
        expireAt = Instant.now().plusSeconds(expiresIn);
        log.info("[wechat] refreshed access token, expires in {} seconds", expiresIn);
        return cachedToken;
    }
}


