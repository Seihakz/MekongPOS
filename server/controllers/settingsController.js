const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');

const getAll = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT setting_key, setting_value, description FROM settings ORDER BY id');

    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.setting_key] = s.setting_value;
    });

    res.json({
      success: true,
      data: settingsObj,
      details: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const [settings] = await pool.query(
      'SELECT setting_key, setting_value, description FROM settings WHERE setting_key = ?',
      [key]
    );

    if (settings.length === 0) {
      return res.status(404).json({ success: false, message: 'Setting not found.' });
    }

    res.json({
      success: true,
      data: {
        key: settings[0].setting_key,
        value: settings[0].setting_value,
        description: settings[0].description
      }
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const update = async (req, res) => {
  let connection;

  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Settings object is required. Format: { settings: { key: value, ... } }'
      });
    }

    const keys = Object.keys(settings);
    if (keys.length === 0) {
      return res.status(400).json({ success: false, message: 'No settings provided.' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const updatedKeys = [];

    for (const key of keys) {
      const value = String(settings[key]);
      const [result] = await connection.query(
        'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
        [value, key]
      );

      if (result.affectedRows > 0) {
        updatedKeys.push(key);
      }
    }

    await connection.commit();
    connection.release();

    // Fetch updated settings
    const [allSettings] = await pool.query('SELECT setting_key, setting_value FROM settings ORDER BY id');
    const settingsObj = {};
    allSettings.forEach((s) => {
      settingsObj[s.setting_key] = s.setting_value;
    });

    res.json({
      success: true,
      message: `Settings updated: ${updatedKeys.join(', ')}`,
      data: settingsObj
    });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
      connection.release();
    }
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = {
  getAll,
  getByKey,
  update
};
