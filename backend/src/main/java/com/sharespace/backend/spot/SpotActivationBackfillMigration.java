package com.sharespace.backend.spot;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class SpotActivationBackfillMigration implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(SpotActivationBackfillMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public SpotActivationBackfillMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("alter table if exists spots add column if not exists is_active boolean");

        int updatedRows = jdbcTemplate.update(
            """
            update spots
            set is_active = true
            where is_active is null
            """
        );

        jdbcTemplate.execute("alter table if exists spots alter column is_active set default true");

        if (updatedRows > 0) {
            logger.info("Backfilled is_active=true for {} existing spot(s).", updatedRows);
        }
    }
}
