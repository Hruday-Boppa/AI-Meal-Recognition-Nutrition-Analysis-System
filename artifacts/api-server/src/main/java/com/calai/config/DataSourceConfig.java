package com.calai.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() throws Exception {
        if (databaseUrl == null || databaseUrl.isBlank()) {
            throw new IllegalStateException("DATABASE_URL environment variable is not set");
        }

        HikariConfig config = new HikariConfig();
        String url = databaseUrl.trim();

        if (url.startsWith("jdbc:")) {
            // Already JDBC format — use as-is but ensure no SSL
            config.setJdbcUrl(ensureNoSsl(url));
        } else {
            // Convert postgres:// or postgresql:// to JDBC URL
            if (url.startsWith("postgres://")) {
                url = "postgresql://" + url.substring("postgres://".length());
            }
            URI uri = new URI(url);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath();
            String userInfo = uri.getUserInfo();

            // Build JDBC URL without SSL (Replit's internal Postgres doesn't need SSL)
            config.setJdbcUrl("jdbc:postgresql://" + host + ":" + port + path + "?sslmode=disable");

            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                config.setUsername(parts[0]);
                config.setPassword(parts[1]);
            }
        }

        config.setDriverClassName("org.postgresql.Driver");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(30000);
        config.setConnectionTestQuery("SELECT 1");

        return new HikariDataSource(config);
    }

    private String ensureNoSsl(String url) {
        if (url.contains("sslmode=require")) {
            return url.replace("sslmode=require", "sslmode=disable");
        }
        if (!url.contains("sslmode")) {
            return url + (url.contains("?") ? "&" : "?") + "sslmode=disable";
        }
        return url;
    }
}
