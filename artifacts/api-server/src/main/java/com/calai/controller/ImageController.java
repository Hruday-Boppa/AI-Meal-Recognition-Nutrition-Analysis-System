package com.calai.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Serves uploaded meal images securely.
 * All endpoints here require a valid JWT (enforced by SecurityConfig).
 * GET /api/images/{userId}/{filename}
 */
@RestController
@RequestMapping("/images")
public class ImageController {

    private final com.calai.service.storage.StorageService storageService;

    public ImageController(com.calai.service.storage.StorageService storageService) {
        this.storageService = storageService;
    }

    @GetMapping("/{userId}/{filename}")
    public ResponseEntity<Resource> serveImage(
            @PathVariable String userId,
            @PathVariable String filename) {

        try {
            Resource resource = storageService.loadAsResource(userId, filename);
            
            MediaType mediaType = filename.toLowerCase().endsWith(".png")
                    ? MediaType.IMAGE_PNG
                    : MediaType.IMAGE_JPEG;

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400, private")
                    .body(resource);
        } catch (java.io.IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
