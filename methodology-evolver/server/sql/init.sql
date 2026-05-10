-- ============================================================
-- 方法论进化器 - 数据库初始化脚本
-- 路径①修正版：动作直接新建，无需从事件提炼
-- ============================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS methodology_evolver 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE methodology_evolver;

-- ============================================================
-- 表1: user 用户主表
-- ============================================================
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `wx_openid` VARCHAR(64) NOT NULL UNIQUE COMMENT '微信OpenID',
  `local_password` VARCHAR(256) DEFAULT NULL COMMENT '本地加密密码',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `last_login_time` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `backup_time` DATETIME DEFAULT NULL COMMENT '云端备份时间',
  `smart_migrate_on` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '智能迁移开关 0关闭/1开启',
  `warning_popup_on` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '避雷弹窗开关 0关闭/1开启',
  `dark_mode` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '深色模式 0浅色/1深色/2跟随系统',
  `privacy_password` VARCHAR(256) DEFAULT NULL COMMENT '隐私密码 AES加密',
  `show_sensitive` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '显示敏感记录 0隐藏/1显示',
  INDEX `idx_wx_openid` (`wx_openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户主表';

-- ============================================================
-- 表2: category 分类表
-- ============================================================
CREATE TABLE IF NOT EXISTS `category` (
  `category_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `category_name` VARCHAR(30) NOT NULL COMMENT '分类名称',
  `is_system_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否系统默认 0自定义/1系统',
  `sort_weight` INT NOT NULL DEFAULT 0 COMMENT '排序权重',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_user_sort` (`user_id`, `sort_weight`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- ============================================================
-- 表3: action_right 对的事动作表（核心层）
-- ============================================================
CREATE TABLE IF NOT EXISTS `action_right` (
  `action_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '动作ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '所属分类ID',
  `action_name` VARCHAR(30) NOT NULL COMMENT '动作名称',
  `subjective_weight` DECIMAL(3,1) NOT NULL DEFAULT 5.0 COMMENT '主观权重 1.0-10.0',
  `exec_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计执行次数',
  `success_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '成功次数',
  `fail_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '失败次数',
  `success_rate` DECIMAL(5,2) UNSIGNED DEFAULT NULL COMMENT '成功率 0.00-100.00',
  `related_tags` JSON DEFAULT NULL COMMENT '关联标签 数组',
  `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '状态 0正常/1归档/2已淘汰',
  `pinned` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否置顶 0否/1是',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_exec_time` DATETIME DEFAULT NULL COMMENT '最后执行时间',
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_user_category` (`user_id`, `category_id`),
  INDEX `idx_success_rate` (`success_rate`),
  INDEX `idx_exec_count` (`exec_count` DESC),
  INDEX `idx_user_pinned` (`user_id`, `pinned`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对的事动作表';

-- ============================================================
-- 表4: law 规律表（二元性：正向/负向）
-- ============================================================
CREATE TABLE IF NOT EXISTS `law` (
  `law_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '规律ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `related_action_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联动作ID 可为空',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '所属分类ID',
  `law_type` TINYINT(1) NOT NULL COMMENT '规律类型 1正向/2负向',
  `law_desc` VARCHAR(500) NOT NULL COMMENT '规律描述',
  `applicable_scenes` VARCHAR(200) DEFAULT NULL COMMENT '适用场景描述',
  `logic_fingerprint` VARCHAR(128) DEFAULT NULL COMMENT '逻辑相似度指纹',
  `popup_enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否开启提醒 仅负向规律',
  `last_popup_time` DATETIME DEFAULT NULL COMMENT '最近弹窗时间',
  `popup_count_today` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '今日弹窗次数',
  `status` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '状态 0正常/1已淘汰',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_type` (`user_id`, `law_type`),
  INDEX `idx_category` (`category_id`),
  INDEX `idx_logic_fp` (`logic_fingerprint`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='规律表';

-- ============================================================
-- 表5: event_raw 原始事件表（可选层，打卡时生成）
-- ============================================================
CREATE TABLE IF NOT EXISTS `event_raw` (
  `event_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '事件ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `action_id` BIGINT UNSIGNED NOT NULL COMMENT '关联动作ID',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '所属分类ID',
  `event_desc` VARCHAR(500) NOT NULL COMMENT '事件描述',
  `emotion_state` VARCHAR(20) DEFAULT NULL COMMENT '情绪状态',
  `remark` VARCHAR(200) DEFAULT NULL COMMENT '主观备注',
  `is_sensitive` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否敏感隐藏 0否/1是',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '事件时间',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_action` (`user_id`, `action_id`),
  INDEX `idx_user_category` (`user_id`, `category_id`),
  INDEX `idx_user_create` (`user_id`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='原始事件表';

-- ============================================================
-- 表6: action_record 执行记录表
-- ============================================================
CREATE TABLE IF NOT EXISTS `action_record` (
  `record_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
  `action_id` BIGINT UNSIGNED NOT NULL COMMENT '关联动作ID',
  `event_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联事件ID 可为空',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `exec_result` TINYINT(1) NOT NULL COMMENT '执行结果 1成功/2失败',
  `exec_remark` VARCHAR(200) DEFAULT NULL COMMENT '本次执行备注',
  `exec_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '执行时间',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_action_id` (`action_id`),
  INDEX `idx_user_time` (`user_id`, `exec_time`),
  INDEX `idx_exec_result` (`exec_result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='执行记录表';

-- ============================================================
-- 表7: migrate_log 迁移记录表（永久留存）
-- ============================================================
CREATE TABLE IF NOT EXISTS `migrate_log` (
  `migrate_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '迁移ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `source_card_id` BIGINT UNSIGNED NOT NULL COMMENT '源卡片ID',
  `source_card_type` VARCHAR(10) NOT NULL COMMENT '源卡片类型 action/law',
  `target_category_id` BIGINT UNSIGNED NOT NULL COMMENT '目标分类ID',
  `migrate_type` TINYINT(1) NOT NULL COMMENT '迁移类型 1手动/2智能',
  `similarity_score` DECIMAL(5,2) UNSIGNED DEFAULT NULL COMMENT '智能迁移相似度',
  `new_card_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '新生成的卡片ID',
  `migrate_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '迁移时间',
  INDEX `idx_user_migrate` (`user_id`, `migrate_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='迁移记录表';

-- ============================================================
-- 表8: review 复盘表
-- ============================================================
CREATE TABLE IF NOT EXISTS `review` (
  `review_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '复盘ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `review_cycle` VARCHAR(10) NOT NULL COMMENT '复盘周期 day/week/month/custom',
  `start_time` DATETIME NOT NULL COMMENT '复盘开始时间',
  `end_time` DATETIME NOT NULL COMMENT '复盘结束时间',
  `review_summary` TEXT DEFAULT NULL COMMENT '复盘总结',
  `snapshot_version` VARCHAR(20) DEFAULT NULL COMMENT '版本号',
  `snapshot_data` JSON DEFAULT NULL COMMENT '复盘快照完整数据',
  `has_snapshot` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否生成快照 0否/1是',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_time` (`user_id`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='复盘表';

-- ============================================================
-- 表9: review_action_log 复盘动作迭代日志
-- ============================================================
CREATE TABLE IF NOT EXISTS `review_action_log` (
  `log_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  `review_id` BIGINT UNSIGNED NOT NULL COMMENT '关联复盘ID',
  `card_id` BIGINT UNSIGNED NOT NULL COMMENT '卡片ID',
  `card_type` VARCHAR(10) NOT NULL COMMENT '卡片类型 action/law',
  `before_status` TINYINT(1) DEFAULT NULL COMMENT '变更前状态',
  `after_status` TINYINT(1) DEFAULT NULL COMMENT '变更后状态',
  `iteration_type` VARCHAR(20) NOT NULL COMMENT '迭代类型 固化/优化/降级/淘汰',
  `iteration_remark` VARCHAR(200) DEFAULT NULL COMMENT '迭代备注',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '变更时间',
  INDEX `idx_review_id` (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='复盘动作迭代日志';

-- ============================================================
-- 表10: sop_template SOP模板表
-- ============================================================
CREATE TABLE IF NOT EXISTS `sop_template` (
  `sop_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '模板ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `sop_name` VARCHAR(30) NOT NULL COMMENT '模板名称',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '所属分类ID',
  `steps` JSON NOT NULL COMMENT '步骤数组',
  `is_auto_generated` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否智能生成 0手动/1智能',
  `exec_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计执行次数',
  `last_exec_time` DATETIME DEFAULT NULL COMMENT '最后执行时间',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_category` (`user_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SOP模板表';

-- ============================================================
-- 表11: card_tag_mapping 关联标签表
-- ============================================================
CREATE TABLE IF NOT EXISTS `card_tag_mapping` (
  `mapping_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '映射ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `card_id` BIGINT UNSIGNED NOT NULL COMMENT '卡片ID',
  `card_type` VARCHAR(10) NOT NULL COMMENT '卡片类型 action/law',
  `tag_name` VARCHAR(20) NOT NULL COMMENT '标签名称',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_tag` (`user_id`, `tag_name`),
  INDEX `idx_card` (`card_id`, `card_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关联标签表';

-- ============================================================
-- 表12: handbook 结构化手册表
-- ============================================================
CREATE TABLE IF NOT EXISTS `handbook` (
  `handbook_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '手册ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `handbook_name` VARCHAR(30) NOT NULL COMMENT '手册名称',
  `category_id` BIGINT UNSIGNED NOT NULL COMMENT '所属分类ID',
  `handbook_content` JSON DEFAULT NULL COMMENT '手册内容快照',
  `version` VARCHAR(20) DEFAULT 'v1.0' COMMENT '版本号',
  `generate_type` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '生成方式 1手动/2自动',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_category` (`user_id`, `category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='结构化手册表';

-- ============================================================
-- 表13: popup_log 弹窗日志表
-- ============================================================
CREATE TABLE IF NOT EXISTS `popup_log` (
  `log_id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  `law_id` BIGINT UNSIGNED NOT NULL COMMENT '关联负向规律ID',
  `popup_type` VARCHAR(20) NOT NULL DEFAULT 'warning_bombing' COMMENT '弹窗类型',
  `popup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '弹窗时间',
  `dismissed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否被忽略 0展示/1忽略/2永久关闭',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_user_today` (`user_id`, `popup_time`),
  INDEX `idx_law_dismissed` (`law_id`, `dismissed`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='弹窗日志表';

-- ============================================================
-- 触发器：执行记录新增时自动更新动作统计
-- ============================================================
DELIMITER //

CREATE TRIGGER trg_after_record_insert
AFTER INSERT ON action_record
FOR EACH ROW
BEGIN
  -- 更新动作统计
  UPDATE action_right 
  SET 
    exec_count = exec_count + 1,
    success_count = IF(NEW.exec_result = 1, success_count + 1, success_count),
    fail_count = IF(NEW.exec_result = 2, fail_count + 1, fail_count),
    success_rate = CASE 
      WHEN (success_count + fail_count + 1) > 0 THEN 
        ROUND((success_count + IF(NEW.exec_result = 1, 1, 0)) / (success_count + fail_count + 1) * 100, 2)
      ELSE NULL 
    END,
    last_exec_time = NEW.exec_time,
    update_time = NOW()
  WHERE action_id = NEW.action_id;
END//

DELIMITER ;

-- ============================================================
-- 存储过程：初始化用户默认分类
-- ============================================================
DELIMITER //

CREATE PROCEDURE sp_init_user_categories(IN p_user_id BIGINT)
BEGIN
  INSERT INTO category (user_id, category_name, is_system_default, sort_weight) VALUES
    (p_user_id, '职场工作', 1, 1),
    (p_user_id, '运动健身', 1, 2),
    (p_user_id, '理财投资', 1, 3),
    (p_user_id, '学习成长', 1, 4),
    (p_user_id, '日常生活', 1, 5),
    (p_user_id, '人际社交', 1, 6);
END//

DELIMITER ;
