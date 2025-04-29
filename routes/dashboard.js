import express from 'express';
import pool from '../db.js';

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
      // Trials (from trial_followups)
      pool.query(`SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive_id=$1 AND is_dropped = false AND created_at >= ${periods.today}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive_id=$1 AND is_dropped = false AND created_at >= ${periods.week}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive_id=$1 AND is_dropped = false AND created_at >= ${periods.month}`, [execId]),

      // Subscribed (from customer_profiles)
      pool.query(`SELECT COUNT(*)::int AS count FROM customer_profiles WHERE assigned_executive=$1 AND subscription_status = 'Subscribed' AND created_at >= ${periods.today}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM customer_profiles WHERE assigned_executive=$1 AND subscription_status = 'Subscribed' AND created_at >= ${periods.week}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM customer_profiles WHERE assigned_executive=$1 AND subscription_status = 'Subscribed' AND created_at >= ${periods.month}`, [execId]),

      // Unsubscribed/Dropped (from follow_ups)
      pool.query(`SELECT COUNT(*)::int AS count FROM follow_ups WHERE executive_id=$1 AND outcome IN ('Unsubscribed', 'Dropped') AND created_at >= ${periods.today}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM follow_ups WHERE executive_id=$1 AND outcome IN ('Unsubscribed', 'Dropped') AND created_at >= ${periods.week}`, [execId]),
      pool.query(`SELECT COUNT(*)::int AS count FROM follow_ups WHERE executive_id=$1 AND outcome IN ('Unsubscribed', 'Dropped') AND created_at >= ${periods.month}`, [execId]),

      // Revenue (from payments)
      pool.query(`SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$1 AND captured_at >= ${periods.today}`, [execId]),
      pool.query(`SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$1 AND captured_at >= ${periods.week}`, [execId]),
      pool.query(`SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$1 AND captured_at >= ${periods.month}`, [execId]),
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
