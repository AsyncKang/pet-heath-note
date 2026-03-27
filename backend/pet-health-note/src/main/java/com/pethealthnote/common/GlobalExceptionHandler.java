package com.pethealthnote.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ApiResponse<Void> handleBusinessException(BusinessException ex) {
        return ApiResponse.error(ex.getCode(), ex.getMessage());
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public ApiResponse<Void> handleValidationException(Exception ex) {
        String message;
        if (ex instanceof MethodArgumentNotValidException) {
            message = ((MethodArgumentNotValidException) ex).getBindingResult()
                    .getFieldErrors()
                    .stream()
                    .findFirst()
                    .map(error -> error.getField() + " " + error.getDefaultMessage())
                    .orElse("参数校验失败");
        } else {
            message = ((BindException) ex).getBindingResult()
                    .getFieldErrors()
                    .stream()
                    .findFirst()
                    .map(error -> error.getField() + " " + error.getDefaultMessage())
                    .orElse("参数校验失败");
        }
        return ApiResponse.error(40000, message);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ApiResponse<Void> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        return ApiResponse.error(40000, "请求体解析失败");
    }

    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handleException(Exception ex) {
        log.error("Unhandled exception", ex);
        return ApiResponse.error(50000, "服务器异常");
    }
}


