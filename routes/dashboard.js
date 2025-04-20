const express = require('express');
const pool = require('../db');

const router = express.Router();

const periods = {
  today: "date_trunc('day', now())",
  week: "date_trunc('week', now())",
  month: "date_trunc('month', now())",
};

router.get('/', async (req, res) => {
  const execId = req.query.executive_id;
  if (!execId) return res.status(400).json({ error: 'executive_id is required' });

  try {
    const [
      trialsDay, trialsWeek, trialsMonth,
      subsDay, subsWeek, subsMonth,
      dropsDay, dropsWeek, dropsMonth,
      revDay, revWeek, revMonth
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive_id=$1 AND is_dropped = false AND created_at >= ${periods.today}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive_id=$1 AND is_dropped = false AND created_at >= ${periods.week}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive_id=$1 AND is_dropped = false AND created_at >= ${periods.month}`, [execId]),

      pool.query(`SELECT COUNT(*)::int AS count FROM subscribed_clients WHERE executive_id=$1 AND converted_on >= ${periods.today}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM subscribed_clients WHERE executive_id=$1 AND converted_on >= ${periods.week}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM subscribed_clients WHERE executive_id=$1 AND converted_on >= ${periods.month}`, [execId]),

      pool.query(`SELECT COUNT(*)::int AS count FROM unsubscribed_clients WHERE executive_id=$1 AND unsubscribed_at >= ${periods.today}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM unsubscribed_clients WHERE executive_id=$1 AND unsubscribed_at >= ${periods.week}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM unsubscribed_clients WHERE executive_id=$1 AND unsubscribed_at >= ${periods.month}`, [execId]),

      pool.query(`SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM subscribed_clients WHERE executive_id=$1 AND converted_on >= ${periods.today}`, [execId]),
      pool.query(`SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM subscribed_clients WHERE executive_id=$1 AND converted_on >= ${periods.week}`, [execId]),
      pool.query(`SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM subscribed_clients WHERE executive_id=$1 AND converted_on >= ${periods.month}`, [execId]),
    ]);

    res.json({
      trials: {
        today: trialsDay.rows[0].count,
        week: trialsWeek.rows[0].count,
        month: trialsMonth.rows[0].count,
      },
      converted: {
        today: subsDay.rows[0].count,
        week: subsWeek.rows[0].count,
        month: subsMonth.rows[0].count,
      },
      dropped: {
        today: dropsDay.rows[0].count,
        week: dropsWeek.rows[0].count,
        month: dropsMonth.rows[0].count,
      },
      revenue: {
        today: parseFloat(revDay.rows[0].sum),
        week: parseFloat(revWeek.rows[0].sum),
        month: parseFloat(revMonth.rows[0].sum),
      },
    });

  } catch (err) {
    console.error('❌ Dashboard error:', err.message);

    // 🛡️ Return safe fallback to avoid frontend crash
    res.json({
      trials: { today: 0, week: 0, month: 0 },
      converted: { today: 0, week: 0, month: 0 },
      dropped: { today: 0, week: 0, month: 0 },
      revenue: { today: 0, week: 0, month: 0 },
    });
  }
});

module.exports = router;
