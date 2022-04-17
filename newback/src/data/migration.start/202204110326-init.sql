-- set force = true in sequelize.config.js
CREATE TABLE `user`
(
    `id`               INTEGER auto_increment,
    `last_time_online` BIGINT                           NOT NULL,
    `username`         VARCHAR(16)                      NOT NULL UNIQUE,
    `sex`              ENUM ('MALE', 'FEMALE', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `thumbnail`        VARCHAR(100)                              DEFAULT NULL,
    `created_at`       DATETIME                         NOT NULL,
    `updated_at`       DATETIME                         NOT NULL,
    `deleted_at`       DATETIME,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `channel`
(
    `id`         INTEGER auto_increment,
    `name`       VARCHAR(16) NOT NULL,
    `creator_id` INTEGER     NOT NULL,
    `created_at` DATETIME    NOT NULL,
    `updated_at` DATETIME    NOT NULL,
    `deleted_at` DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `room`
(
    `id`                 INTEGER auto_increment,
    `name`               VARCHAR(16),
    `is_main_in_channel` TINYINT(1) NOT NULL DEFAULT false,
    `p2p`                TINYINT(1) NOT NULL DEFAULT false,
    `channel_id`         INTEGER             DEFAULT NULL,
    `creator_id`         INTEGER             DEFAULT NULL,
    `created_at`         DATETIME   NOT NULL,
    `updated_at`         DATETIME   NOT NULL,
    `deleted_at`         DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`channel_id`) REFERENCES `channel` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    constraint admin_should_not_be_define_for_private_rooms check (`creator_id` is null or `name` is not null),
    constraint channel_should_exist_for_public_room_and_not_exist_for_private check (`channel_id` is null and `name` is null or `channel_id` is not null),
    constraint p2p_only_if_private check (`p2p` = 0x00 or `name` is null)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `message`
(
    `id`                   INTEGER auto_increment,
    `sender_id`            INTEGER                                NOT NULL,
    `room_id`              INTEGER                                NOT NULL,
    `time`                 BIGINT                                 NOT NULL,
    `content`              LONGTEXT,
    `symbol`               VARCHAR(1),
    `message_status`       ENUM ('ON_SERVER', 'READ', 'RECEIVED') NOT NULL,
    `thread_message_count` INTEGER                                NOT NULL DEFAULT 0,
    `parent_message_id`    INTEGER,
    `created_at`           DATETIME                               NOT NULL,
    `updated_at`           DATETIME                               NOT NULL,
    `deleted_at`           DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    FOREIGN KEY (`room_id`) REFERENCES `room` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    FOREIGN KEY (`parent_message_id`) REFERENCES `message` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `image`
(
    `id`         INTEGER auto_increment,
    `type`       ENUM ('VIDEO', 'FILE', 'MEDIA_RECORD', 'AUDIO_RECORD', 'IMAGE', 'PREVIEW', 'GIPHY') NOT NULL,
    `symbol`     VARCHAR(1)                                                                          NOT NULL,
    `message_id` INTEGER                                                                             NOT NULL,
    `img`        VARCHAR(255)                                                                        NOT NULL,
    `preview`    VARCHAR(255),
    `created_at` DATETIME                                                                            NOT NULL,
    `updated_at` DATETIME                                                                            NOT NULL,
    `deleted_at` DATETIME,
    UNIQUE `unique_image_symbol_message` (`symbol`, `message_id`),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`message_id`) REFERENCES `message` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `ip_address`
(
    `id`           INTEGER auto_increment,
    `ip`           VARCHAR(32) NOT NULL UNIQUE,
    `status`       TINYINT(1)  NOT NULL DEFAULT true,
    `isp`          VARCHAR(255),
    `country_code` VARCHAR(16),
    `country`      VARCHAR(64),
    `region`       VARCHAR(64),
    `city`         VARCHAR(64),
    `lat`          DOUBLE PRECISION,
    `lon`          DOUBLE PRECISION,
    `zip`          VARCHAR(32),
    `timezone`     VARCHAR(32),
    `created_at`   DATETIME    NOT NULL,
    `updated_at`   DATETIME    NOT NULL,
    `deleted_at`   DATETIME,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `message_history`
(
    `id`         INTEGER auto_increment,
    `message_id` INTEGER  NOT NULL,
    `time`       BIGINT   NOT NULL,
    `content`    LONGTEXT,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL,
    `deleted_at` DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`message_id`) REFERENCES `message` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `message_mention`
(
    `id`         INTEGER auto_increment,
    `user_id`    INTEGER    NOT NULL,
    `message_id` INTEGER    NOT NULL,
    `symbol`     VARCHAR(1) NOT NULL,
    `created_at` DATETIME   NOT NULL,
    `updated_at` DATETIME   NOT NULL,
    `deleted_at` DATETIME,
    UNIQUE `unique_message_mention_user_id_symbol_message_id` (`user_id`, `message_id`, `symbol`),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    FOREIGN KEY (`message_id`) REFERENCES `message` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `room_user`
(
    `id`            INTEGER auto_increment,
    `room_id`       INTEGER    NOT NULL,
    `user_id`       INTEGER    NOT NULL,
    `volume`        INTEGER    NOT NULL DEFAULT 2,
    `notifications` TINYINT(1) NOT NULL DEFAULT true,
    `created_at`    DATETIME   NOT NULL,
    `updated_at`    DATETIME   NOT NULL,
    `deleted_at`    DATETIME,
    UNIQUE `unique_room_user_room_id_user_id` (`room_id`, `user_id`),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`room_id`) REFERENCES `room` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `subscription`
(
    `id`              INTEGER auto_increment,
    `user_id`         INTEGER      NOT NULL,
    `registration_id` VARCHAR(255) NOT NULL UNIQUE,
    `agent`           VARCHAR(64),
    `is_mobile`       TINYINT(1)   NOT NULL DEFAULT false,
    `ip_id`           INTEGER,
    `created_at`      DATETIME     NOT NULL,
    `updated_at`      DATETIME     NOT NULL,
    `deleted_at`      DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    FOREIGN KEY (`ip_id`) REFERENCES `ip_address` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `subscription_message`
(
    `id`              INTEGER auto_increment,
    `subscription_id` INTEGER    NOT NULL,
    `message_id`      INTEGER    NOT NULL,
    `received`        TINYINT(1) NOT NULL DEFAULT false,
    `created_at`      DATETIME   NOT NULL,
    `updated_at`      DATETIME   NOT NULL,
    `deleted_at`      DATETIME,
    UNIQUE `unique_subscription_message_subscription_id_message_id` (`subscription_id`, `message_id`),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`subscription_id`) REFERENCES `subscription` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    FOREIGN KEY (`message_id`) REFERENCES `message` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `uploaded_file`
(
    `id`         INTEGER auto_increment,
    `type`       ENUM ('VIDEO', 'FILE', 'MEDIA_RECORD', 'AUDIO_RECORD', 'IMAGE', 'PREVIEW', 'GIPHY') NOT NULL,
    `symbol`     VARCHAR(1)                                                                          NOT NULL,
    `user_id`    INTEGER                                                                             NOT NULL,
    `file`       VARCHAR(255)                                                                        NOT NULL,
    `created_at` DATETIME                                                                            NOT NULL,
    `updated_at` DATETIME                                                                            NOT NULL,
    `deleted_at` DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `verification`
(
    `id`         INTEGER auto_increment,
    `type`       ENUM ('REGISTER', 'PASSWORD', 'EMAIL') NOT NULL,
    `token`      VARCHAR(32)                            NOT NULL,
    `user_id`    INTEGER                                NOT NULL,
    `verified`   TINYINT(1)                             NOT NULL DEFAULT false,
    `email`      VARCHAR(190),
    `created_at` DATETIME                               NOT NULL,
    `updated_at` DATETIME                               NOT NULL,
    `deleted_at` DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `user_auth`
(
    `id`                    INTEGER,
    `password`              VARCHAR(255) NOT NULL,
    `email`                 VARCHAR(255) UNIQUE,
    `facebook_id`           VARCHAR(255) UNIQUE,
    `google_id`             VARCHAR(255) UNIQUE,
    `email_verification_id` INTEGER,
    `created_at`            DATETIME     NOT NULL,
    `updated_at`            DATETIME     NOT NULL,
    `deleted_at`            DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    FOREIGN KEY (`email_verification_id`) REFERENCES `verification` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `user_joined_info`
(
    `id`         INTEGER auto_increment,
    `ip_id`      INTEGER  NOT NULL,
    `user_id`    INTEGER  NOT NULL,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL,
    `deleted_at` DATETIME,
    UNIQUE `unique_user_joined_info_user_id_ip_id` (`ip_id`, `user_id`),
    PRIMARY KEY (`id`),
    FOREIGN KEY (`ip_id`) REFERENCES `ip_address` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `user_profile`
(
    `id`         INTEGER,
    `name`       VARCHAR(30),
    `city`       VARCHAR(50),
    `surname`    VARCHAR(30),
    `birthday`   DATE,
    `contacts`   VARCHAR(100),
    `image`      VARCHAR(100) DEFAULT NULL,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL,
    `deleted_at` DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;
CREATE TABLE `user_settings`
(
    `id`                       INTEGER,
    `suggestions`              TINYINT(1)                                                                                          NOT NULL DEFAULT true,
    `show_when_i_typing`       TINYINT(1)                                                                                          NOT NULL DEFAULT true,
    `embedded_youtube`         TINYINT(1)                                                                                          NOT NULL DEFAULT true,
    `highlight_code`           TINYINT(1)                                                                                          NOT NULL DEFAULT true,
    `message_sound`            TINYINT(1)                                                                                          NOT NULL DEFAULT false,
    `incoming_file_call_sound` TINYINT(1)                                                                                          NOT NULL DEFAULT false,
    `online_change_sound`      TINYINT(1)                                                                                          NOT NULL DEFAULT false,
    `logs`                     ENUM ('log_raise_error', 'log_with_warnings', 'trace', 'debug', 'info', 'warn', 'error', 'disable') NOT NULL DEFAULT 'error',
    `theme`                    ENUM ('COLOR_LOR', 'COLOR_REG', 'COLOR_WHITE')                                                      NOT NULL DEFAULT 'COLOR_REG',
    `created_at`               DATETIME                                                                                            NOT NULL,
    `updated_at`               DATETIME                                                                                            NOT NULL,
    `deleted_at`               DATETIME,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE utf8mb4_general_ci;

-- INSERT INTO user (id, last_time_online, username, sex, thumbnail, created_at, updated_at, deleted_at) VALUES (1, 1649949638861, '1', 'OTHER', null, '2022-04-13 13:37:37', '2022-04-13 13:37:37', null);
-- INSERT INTO channel (id, name, creator_id, created_at, updated_at, deleted_at) VALUES (1, 'all', 1, '2022-04-13 16:32:11', '2022-04-13 16:32:09', null);
-- INSERT INTO room (id, name, is_main_in_channel, p2p, channel_id, creator_id, created_at, updated_at, deleted_at) VALUES (1, 'all', 1, DEFAULT, 1, 1, '2022-04-13 16:35:16', '2022-04-13 16:35:20', null);
-- INSERT INTO user_profile (id, name, city, surname, birthday, contacts, created_at, updated_at, deleted_at) VALUES (1, null, null, null, null, null, '2022-04-13 13:37:37', '2022-04-13 13:37:37', null);
-- INSERT INTO user_auth (id, password, email, facebook_id, google_id, email_verification_id, created_at, updated_at, deleted_at) VALUES (1, '$2b$10$8RTcHp1.oCEYGiPgLbTHH.Fk8MC6YUySzJ8AxGFxnjFqb.zsdlH7m', 'deathangel908@gmail.com', null, null, null, '2022-04-13 13:37:37', '2022-04-13 13:37:37', null);
-- INSERT INTO user_settings (id, suggestions, show_when_i_typing, embedded_youtube, highlight_code, message_sound, incoming_file_call_sound, online_change_sound, logs, theme, created_at, updated_at, deleted_at) VALUES (1, 1, 1, 1, 1, 0, 0, 0, 'error', 'COLOR_REG', '2022-04-13 13:37:37', '2022-04-13 13:37:37', null);
-- INSERT INTO room_user (id, room_id, user_id, volume, notifications, created_at, updated_at, deleted_at) VALUES (1, 1, 1, 2, 0, '2022-04-13 13:37:37', '2022-04-13 13:37:37', null);
