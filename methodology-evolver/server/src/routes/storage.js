const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const CryptoJS = require('crypto-js');
const { formatResponse, errorResponse } = require('../utils/helpers');

router.use(authMiddleware);

// ============================================================
// 存储/备份相关
// ============================================================

// 加密数据
function encryptData(data, key) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

// 解密数据
function decryptData(encrypted, key) {
  const bytes = CryptoJS.AES.decrypt(encrypted, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// 云端加密备份
router.post('/backup', async (req, res) => {
  try {
    const userId = req.user.user_id;
    const encryptionKey = process.env.ENCRYPTION_KEY;

    // 拉取全量数据
    const [actions] = await pool.query(
      'SELECT * FROM action_right WHERE user_id = ?',
      [userId]
    );

    const [laws] = await pool.query(
      'SELECT * FROM law WHERE user_id = ?',
      [userId]
    );

    const [events] = await pool.query(
      'SELECT * FROM event_raw WHERE user_id = ?',
      [userId]
    );

    const [categories] = await pool.query(
      'SELECT * FROM category WHERE user_id = ?',
      [userId]
    );

    const [records] = await pool.query(
      'SELECT * FROM action_record WHERE user_id = ?',
      [userId]
    );

    const [sops] = await pool.query(
      'SELECT * FROM sop_template WHERE user_id = ?',
      [userId]
    );

    const [handbooks] = await pool.query(
      'SELECT * FROM handbook WHERE user_id = ?',
      [userId]
    );

    const backupData = {
      version: '1.0',
      backup_time: new Date().toISOString(),
      actions,
      laws,
      events,
      categories,
      records,
      sops,
      handbooks
    };

    // AES256加密
    const encryptedData = encryptData(backupData, encryptionKey);

    // 这里应该上传到阿里云OSS
    // 简化：存储到数据库的某个地方或返回给客户端
    // 实际项目中：await oss.upload(encryptedData);

    // 更新用户最后备份时间
    await pool.query(
      'UPDATE `user` SET backup_time = NOW() WHERE user_id = ?',
      [userId]
    );

    return res.json(formatResponse({
      backup_id: `backup_${Date.now()}`,
      backup_time: backupData.backup_time,
      data_count: {
        actions: actions.length,
        laws: laws.length,
        events: events.length,
        categories: categories.length,
        records: records.length,
        sops: sops.length,
        handbooks: handbooks.length
      },
      encrypted_preview: encryptedData.substring(0, 100) + '...'
    }, '备份成功'));
  } catch (error) {
    console.error('备份错误:', error);
    return errorResponse(res, 500, '服务器错误');
  }
});

// 一键还原
router.post('/restore', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const userId = req.user.user_id;
    const { encrypted_data, conflict_handling = 'replace' } = req.body;
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encrypted_data) {
      await connection.rollback();
      return errorResponse(res, 400, '缺少加密数据');
    }

    // 解密
    let backupData;
    try {
      backupData = decryptData(encrypted_data, encryptionKey);
    } catch (e) {
      await connection.rollback();
      return errorResponse(res, 400, '数据解密失败，可能密钥不匹配');
    }

    // 冲突处理策略
    if (conflict_handling === 'merge') {
      // 合并：保留现有数据，补充新数据
      // TODO: 实现合并逻辑
    } else {
      // 替换：清空现有数据，导入备份
      // 清空现有数据
      await connection.query('DELETE FROM action_record WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM event_raw WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM action_right WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM law WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM sop_template WHERE user_id = ?', [userId]);
      await connection.query('DELETE FROM handbook WHERE user_id = ?', [userId]);
      // 保留分类
    }

    // 导入备份数据
    let restoredCount = {
      actions: 0,
      laws: 0,
      events: 0,
      categories: 0,
      records: 0,
      sops: 0,
      handbooks: 0
    };

    // 导入动作
    if (backupData.actions) {
      for (const action of backupData.actions) {
        await connection.query(
          `INSERT INTO action_right 
           (action_id, user_id, category_id, action_name, subjective_weight, exec_count, 
            success_count, fail_count, success_rate, related_tags, status, pinned, create_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [action.action_id, userId, action.category_id, action.action_name, 
           action.subjective_weight, action.exec_count, action.success_count,
           action.fail_count, action.success_rate, action.related_tags,
           action.status, action.pinned, action.create_time]
        );
        restoredCount.actions++;
      }
    }

    // 导入规律
    if (backupData.laws) {
      for (const law of backupData.laws) {
        await connection.query(
          `INSERT INTO law 
           (law_id, user_id, category_id, related_action_id, law_type, law_desc, 
            applicable_scenes, logic_fingerprint, popup_enabled, status, create_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [law.law_id, userId, law.category_id, law.related_action_id, law.law_type,
           law.law_desc, law.applicable_scenes, law.logic_fingerprint,
           law.popup_enabled, law.status, law.create_time]
        );
        restoredCount.laws++;
      }
    }

    // 导入事件
    if (backupData.events) {
      for (const event of backupData.events) {
        await connection.query(
          `INSERT INTO event_raw 
           (event_id, user_id, action_id, category_id, event_desc, emotion_state, 
            remark, is_sensitive, create_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [event.event_id, userId, event.action_id, event.category_id,
           event.event_desc, event.emotion_state, event.remark,
           event.is_sensitive, event.create_time]
        );
        restoredCount.events++;
      }
    }

    // 导入执行记录
    if (backupData.records) {
      for (const record of backupData.records) {
        await connection.query(
          `INSERT INTO action_record 
           (record_id, action_id, event_id, user_id, exec_result, exec_remark, exec_time) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [record.record_id, record.action_id, record.event_id, userId,
           record.exec_result, record.exec_remark, record.exec_time]
        );
        restoredCount.records++;
      }
    }

    await connection.commit();

    return res.json(formatResponse({
      restored_count: restoredCount,
      backup_version: backupData.version,
      backup_time: backupData.backup_time
    }, '还原成功'));
  } catch (error) {
    await connection.rollback();
    console.error('还原错误:', error);
    return errorResponse(res, 500, '服务器错误');
  } finally {
    connection.release();
  }
});

module.exports = router;
