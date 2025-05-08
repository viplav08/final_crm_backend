// --- START OF FILE dashboard.js ---
import express from 'express';
import pool from '../db.js'; // Ensure this path is correct

const router = express.Router();

// Helper for date range conditions
// For 'today': >= today_start AND < tomorrow_start
// For 'week': >= week_start AND < next_week_start
// For 'month': >= month_start AND < next_month_start
const getDateCondition = (period, dateColumn = 'created_at') => {
  switch (period) {
    case 'today':
      return `AND ${dateColumn} >= date_trunc('day', now()) AND ${dateColumn} < (date_trunc('day', now()) + interval '1 day')`;
    case 'week':
      return `AND ${dateColumn} >= date_trunc('week', now()) AND ${dateColumn} < (date_trunc('week', now()) + interval '1 week')`;
    case 'month':
      return `AND ${dateColumn} >= date_trunc('month', now()) AND ${dateColumn} < (date_trunc('month', now()) + interval '1 month')`;
    default:
      return ''; // Should not happen if period is validated
  }
};

router.get('/', async (req, res) => {
  const execId = req.query.executive_id;
  if (!execId) {
    return res.status(400).json({ error: 'executive_id is required' });
  }

  try {
    // --- Trials (from trial_followups) ---
    // Counts active trials created within the specified period by the executive.
    const trialsTodayQuery = `SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive_id=$1 AND is_dropped = false ${getDateCondition('today', 'created_at')}`;
    const trialsWeekQuery = `SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive_id=$1 AND is_dropped = false ${getDateCondition('week', 'created_at')}`;
    const trialsMonthQuery = `SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive_id=$1 AND is_dropped = false ${getDateCondition('month', 'created_at')}`;

    // --- Subscribed/Converted (from customer_profiles) ---
    // Counts customers assigned to the executive, marked as 'Subscribed',
    // and whose profile (or subscription status update) occurred within the period.
    // ASSUMPTION: 'created_at' in customer_profiles reflects the relevant date for this status.
    // If you have a `subscription_date` or `status_updated_at`, use that instead of 'created_at'.
    const subscribedTodayQuery = `SELECT COUNT(*)::int AS count FROM customer_profiles WHERE assigned_executive=$1 AND subscription_status = 'Subscribed' ${getDateCondition('today', 'created_at')}`;
    const subscribedWeekQuery = `SELECT COUNT(*)::int AS count FROM customer_profiles WHERE assigned_executive=$1 AND subscription_status = 'Subscribed' ${getDateCondition('week', 'created_at')}`;
    const subscribedMonthQuery = `SELECT COUNT(*)::int AS count FROM customer_profiles WHERE assigned_executive=$1 AND subscription_status = 'Subscribed' ${getDateCondition('month', 'created_at')}`;
    
    // ALTERNATIVE for Subscribed (if you use 'subscribed_clients' table and want to count conversions by conversion date):
    // const subscribedTodayQuery = `SELECT COUNT(*)::int AS count FROM subscribed_clients WHERE executive_id=$1 ${getDateCondition('today', 'converted_on')}`;
    // const subscribedWeekQuery = `SELECT COUNT(*)::int AS count FROM subscribed_clients WHERE executive_id=$1 ${getDateCondition('week', 'converted_on')}`;
    // const subscribedMonthQuery = `SELECT COUNT(*)::int AS count FROM subscribed_clients WHERE executive_id=$1 ${getDateCondition('month', 'converted_on')}`;


    // --- Unsubscribed/Dropped ---
    // Counts entries from the 'unsubscribed_clients' table for more direct tracking.
    // ASSUMPTION: 'unsubscribed_at' reflects when they were marked as unsubscribed.
    const droppedTodayQuery = `SELECT COUNT(*)::int AS count FROM unsubscribed_clients WHERE executive_id=$1 ${getDateCondition('today', 'unsubscribed_at')}`;
    const droppedWeekQuery = `SELECT COUNT(*)::int AS count FROM unsubscribed_clients WHERE executive_id=$1 ${getDateCondition('week', 'unsubscribed_at')}`;
    const droppedMonthQuery = `SELECT COUNT(*)::int AS count FROM unsubscribed_clients WHERE executive_id=$1 ${getDateCondition('month', 'unsubscribed_at')}`;
    
    // --- Revenue (from payments) ---
    // Sums payment_amount for payments captured within the period by the executive.
    const revenueTodayQuery = `SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$1 ${getDateCondition('today', 'captured_at')}`;
    const revenueWeekQuery = `SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$1 ${getDateCondition('week', 'captured_at')}`;
    const revenueMonthQuery = `SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$1 ${getDateCondition('month', 'captured_at')}`;

    const [
      trialsDayRes, trialsWeekRes, trialsMonthRes,
      subsDayRes, subsWeekRes, subsMonthRes,
      dropsDayRes, dropsWeekRes, dropsMonthRes,
      revDayRes, revWeekRes, revMonthRes
    ] = await Promise.all([
      pool.query(trialsTodayQuery, [execId]),
      pool.query(trialsWeekQuery, [execId]),
      pool.query(trialsMonthQuery, [execId]),

      pool.query(subscribedTodayQuery, [execId]),
      pool.query(subscribedWeekQuery, [execId]),
      pool.query(subscribedMonthQuery, [execId]),

      pool.query(droppedTodayQuery, [execId]),
      pool.query(droppedWeekQuery, [execId]),
      pool.query(droppedMonthQuery, [execId]),

      pool.query(revenueTodayQuery, [execId]),
      pool.query(revenueWeekQuery, [execId]),
      pool.query(revenueMonthQuery, [execId]),
    ]);

    res.json({
      trials: {
        today: trialsDayRes.rows[0]?.count || 0,
        week: trialsWeekRes.rows[0]?.count || 0,
        month: trialsMonthRes.rows[0]?.count || 0,
      },
      converted: { // "Subscribed" in UI
        today: subsDayRes.rows[0]?.count || 0,
        week: subsWeekRes.rows[0]?.count || 0,
        month: subsMonthRes.rows[0]?.count || 0,
      },
      dropped: { // "Unsubscribed" in UI
        today: dropsDayRes.rows[0]?.count || 0,
        week: dropsWeekRes.rows[0]?.count || 0,
        month: dropsMonthRes.rows[0]?.count || 0,
      },
      revenue: {
        today: parseFloat(revDayRes.rows[0]?.sum || 0),
        week: parseFloat(revWeekRes.rows[0]?.sum || 0),
        month: parseFloat(revMonthRes.rows[0]?.sum || 0),
      },
    });
  } catch (err) {
    console.error('❌ Dashboard error:', err.message, err.stack); // Added err.stack for more details
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
// --- END OF FILE dashboard.js ---