package com.pethealthnote.auth.service;

import com.pethealthnote.auth.dto.WeChatSessionResponse;
import com.pethealthnote.common.BusinessException;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class WeChatAuthService {

    private static final String CODE2SESSION_URL =
        "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=%s";

    private final WeChatMiniAppProperties properties;
    private final RestTemplate restTemplate;

    public WeChatAuthService(WeChatMiniAppProperties properties) {
        this.properties = properties;
        this.restTemplate = initRestTemplate();
    }

    private RestTemplate initRestTemplate() {
        RestTemplate template = new RestTemplate();
        List<HttpMessageConverter<?>> converters = new ArrayList<>(template.getMessageConverters());
        for (HttpMessageConverter<?> converter : converters) {
            if (converter instanceof MappingJackson2HttpMessageConverter) {
                MappingJackson2HttpMessageConverter jsonConverter = (MappingJackson2HttpMessageConverter) converter;
                List<MediaType> mediaTypes = new ArrayList<>(jsonConverter.getSupportedMediaTypes());
                mediaTypes.add(MediaType.TEXT_PLAIN);
                mediaTypes.add(MediaType.TEXT_HTML);
                jsonConverter.setSupportedMediaTypes(mediaTypes);
            }
        }
        template.getMessageConverters().clear();
        template.getMessageConverters().addAll(converters);
        return template;
    }

    public WeChatSessionResponse code2Session(String jsCode) {
        if (!StringUtils.hasText(jsCode)) {
            throw new BusinessException("JS Code不能为空");
        }
        if (!StringUtils.hasText(properties.getAppId()) || !StringUtils.hasText(properties.getSecret())) {
            throw new BusinessException("请先在application.yml配置微信小程序的app-id与secret");
        }

        String url = String.format(
            CODE2SESSION_URL,
            properties.getAppId(),
            properties.getSecret(),
            jsCode,
            properties.getGrantType()
        );
        WeChatSessionResponse response = restTemplate.getForObject(url, WeChatSessionResponse.class);
        if (response == null) {
            throw new BusinessException("调用微信接口失败，未获取到响应");
        }
        if (response.getErrCode() != null && response.getErrCode() != 0) {
            throw new BusinessException(
                String.format("微信接口报错：%s(%s)", response.getErrMsg(), response.getErrCode())
            );
        }
        if (!StringUtils.hasText(response.getOpenId())) {
            throw new BusinessException("微信接口未返回openid");
        }
        return response;
    }
}


