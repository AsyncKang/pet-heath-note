package com.pethealthnote.weather;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class WeatherService {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final Map<Integer, String> WEATHER_MAP = new HashMap<>();

    static {
        WEATHER_MAP.put(0, "晴");
        WEATHER_MAP.put(1, "晴");
        WEATHER_MAP.put(2, "晴");
        WEATHER_MAP.put(3, "晴");
        WEATHER_MAP.put(45, "雾");
        WEATHER_MAP.put(48, "雾");
        WEATHER_MAP.put(51, "小雨");
        WEATHER_MAP.put(53, "小雨");
        WEATHER_MAP.put(55, "小雨");
        WEATHER_MAP.put(61, "中雨");
        WEATHER_MAP.put(63, "大雨");
        WEATHER_MAP.put(71, "小雪");
        WEATHER_MAP.put(73, "中雪");
        WEATHER_MAP.put(75, "大雪");
        WEATHER_MAP.put(80, "阵雨");
        WEATHER_MAP.put(81, "阵雨");
        WEATHER_MAP.put(82, "阵雨");
    }

    public String getCurrentWeather(BigDecimal latitude, BigDecimal longitude) {
        String url = String.format(
                "https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current_weather=true",
                latitude, longitude);
        ResponseEntity<JsonNode> response = restTemplate.getForEntity(url, JsonNode.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            return "未知天气";
        }
        JsonNode current = response.getBody().path("current_weather");
        int code = current.path("weathercode").asInt(-1);
        double temperature = current.path("temperature").asDouble();
        String desc = WEATHER_MAP.getOrDefault(code, "多云");
        return String.format("%s %.1f℃", desc, temperature);
    }
}


