package com.calai.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private final Map<Long, Bucket> scanBuckets = new ConcurrentHashMap<>();
    private final Map<Long, Bucket> generalBuckets = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.scans-per-5min:10}")
    private int scansPer5Min;

    @Value("${app.rate-limit.requests-per-min:50}")
    private int requestsPerMin;

    public Bucket resolveScanBucket(Long userId) {
        return scanBuckets.computeIfAbsent(userId, this::newScanBucket);
    }

    public Bucket resolveGeneralBucket(Long userId) {
        return generalBuckets.computeIfAbsent(userId, this::newGeneralBucket);
    }

    private Bucket newScanBucket(Long userId) {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(scansPer5Min, Refill.intervally(scansPer5Min, Duration.ofMinutes(5))))
                .build();
    }

    private Bucket newGeneralBucket(Long userId) {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(requestsPerMin, Refill.intervally(requestsPerMin, Duration.ofMinutes(1))))
                .build();
    }
}
