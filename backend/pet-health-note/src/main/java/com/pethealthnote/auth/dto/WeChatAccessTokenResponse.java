package com.pethealthnote.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class WeChatAccessTokenResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("expires_in")
    private Long expiresIn;

    @JsonProperty("errcode")
    private Integer errCode;

    @JsonProperty("errmsg")
    private String errMsg;
}


