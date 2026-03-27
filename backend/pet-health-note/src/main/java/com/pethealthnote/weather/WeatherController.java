package com.pethealthnote.weather;

import com.pethealthnote.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/current")
    public ApiResponse<String> getCurrentWeather(@RequestParam BigDecimal lat,
                                                 @RequestParam BigDecimal lon) {
        return ApiResponse.success(weatherService.getCurrentWeather(lat, lon));
    }
}


