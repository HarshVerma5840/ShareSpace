package com.sharespace.backend.user;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class LegacyGuestRoleMigration implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(LegacyGuestRoleMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public LegacyGuestRoleMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("alter table if exists app_users drop constraint if exists app_users_role_check");
        jdbcTemplate.execute(
            """
            alter table if exists app_users
            add constraint app_users_role_check
            check (role in ('ADMIN', 'HOST', 'COMMUTER', 'TOURIST', 'GUEST'))
            """
        );

        int updatedRows = jdbcTemplate.update(
            """
            update app_users
            set role = 'TOURIST',
                verification_status = 'NOT_APPLICABLE'
            where role = 'GUEST'
            """
        );

        jdbcTemplate.execute("alter table if exists app_users drop constraint if exists app_users_role_check");
        jdbcTemplate.execute(
            """
            alter table if exists app_users
            add constraint app_users_role_check
            check (role in ('ADMIN', 'HOST', 'COMMUTER', 'TOURIST'))
            """
        );

        if (updatedRows > 0) {
            logger.info("Migrated {} legacy GUEST account(s) to TOURIST.", updatedRows);
        }
    }
}
