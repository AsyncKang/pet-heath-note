package com.pethealthnote.common.controller;

import com.pethealthnote.common.ApiResponse;
import com.pethealthnote.common.BusinessException;
import com.pethealthnote.common.dto.FileUploadResponse;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads";

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FileUploadResponse> uploadFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("上传文件不能为空");
        }
        String originalFilename = file.getOriginalFilename();
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = UUID.randomUUID().toString().replaceAll("-", "").substring(0, 6);
        String filename = extension == null
                ? String.format("%s_%s", timestamp, random)
                : String.format("%s_%s.%s", timestamp, random, extension);

        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(filename);
        file.transferTo(filePath.toFile());

        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(filename)
                .toUriString();

        return ApiResponse.success(new FileUploadResponse(fileUrl));
    }
}


