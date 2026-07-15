-- CreateTable
CREATE TABLE `sources` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sources_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `schema_versions` (
    `id` VARCHAR(36) NOT NULL,
    `source_id` VARCHAR(36) NOT NULL,
    `version` INTEGER NOT NULL,
    `fields` JSON NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `schema_versions_source_id_idx`(`source_id`),
    UNIQUE INDEX `schema_versions_source_id_version_key`(`source_id`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `import_jobs` (
    `id` VARCHAR(36) NOT NULL,
    `source_id` VARCHAR(36) NOT NULL,
    `schema_version_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'SUCCESS', 'PARTIAL', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `filepath` VARCHAR(500) NOT NULL,
    `original_filename` VARCHAR(255) NOT NULL,
    `error_message` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `started_at` DATETIME(3) NULL,
    `finished_at` DATETIME(3) NULL,

    INDEX `import_jobs_source_id_idx`(`source_id`),
    INDEX `import_jobs_user_id_idx`(`user_id`),
    INDEX `import_jobs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imported_rows` (
    `id` VARCHAR(36) NOT NULL,
    `import_job_id` VARCHAR(36) NOT NULL,
    `row_index` INTEGER NOT NULL,
    `data` JSON NOT NULL,
    `is_valid` BOOLEAN NOT NULL,

    INDEX `imported_rows_import_job_id_idx`(`import_job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `validation_errors` (
    `id` VARCHAR(36) NOT NULL,
    `imported_row_id` VARCHAR(36) NOT NULL,
    `column` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,

    INDEX `validation_errors_imported_row_id_idx`(`imported_row_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `validation_reports` (
    `id` VARCHAR(36) NOT NULL,
    `import_job_id` VARCHAR(36) NOT NULL,
    `total` INTEGER NOT NULL,
    `valid_count` INTEGER NOT NULL,
    `invalid_count` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `validation_reports_import_job_id_key`(`import_job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sources` ADD CONSTRAINT `sources_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schema_versions` ADD CONSTRAINT `schema_versions_source_id_fkey` FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `import_jobs` ADD CONSTRAINT `import_jobs_source_id_fkey` FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `import_jobs` ADD CONSTRAINT `import_jobs_schema_version_id_fkey` FOREIGN KEY (`schema_version_id`) REFERENCES `schema_versions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `import_jobs` ADD CONSTRAINT `import_jobs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `imported_rows` ADD CONSTRAINT `imported_rows_import_job_id_fkey` FOREIGN KEY (`import_job_id`) REFERENCES `import_jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `validation_errors` ADD CONSTRAINT `validation_errors_imported_row_id_fkey` FOREIGN KEY (`imported_row_id`) REFERENCES `imported_rows`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `validation_reports` ADD CONSTRAINT `validation_reports_import_job_id_fkey` FOREIGN KEY (`import_job_id`) REFERENCES `import_jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
