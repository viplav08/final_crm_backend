// --- START OF FILE dashboard.js ---
import express from 'express';
import pool from '../db.js'; // Ensure this path isAh correct

const router = express.Router();

// Helper for date range conditions
const getDateCondition = (period, dateColumn, okay! Thank you for the clarification. That changes the definition of the "Trials" metric significantly.

If " = 'created_at') => {
  switch (period) {
    case 'today':
      return `AND ${dateColumn} >= date_trunc('day', now()) AND ${dateColumn} < (date_trunc('dayTrials Today/Week/Month" simply means **"How many new trial records were created for this executive in that period,', now()) + interval '1 day')`;
    case 'week':
      return `AND ${dateColumn} >= date_trunc('week', now()) AND ${dateColumn} < (date_trunc('week', now regardless of their current `is_dropped` status?"** then the `is_dropped = false` condition needs to be removed from()) + interval '1 week')`;
    case 'month':
      return `AND ${dateColumn} >= the trials queries.

This means you want to see the *gross number of trials initiated*.

Let's update ` date_trunc('month', now()) AND ${dateColumn} < (date_trunc('month', now()) +dashboard.js` with this understanding.

**Corrected `dashboard.js` (Reflecting "Gross Trials Initiated"): interval '1 month')`;
    default:
      console.warn(`getDateCondition called with unrecognized period: ${period}. Returning empty condition.`);
      return '';
  }
};

router.get('/', async (req,**

```javascript
// --- START OF FILE dashboard.js ---
import express from 'express';
import pool from '../db res) => {
  const execId = req.query.executive_id;
  if (!execId.js'; // Ensure this path is correct

const router = express.Router();

// Helper for date range conditions) {
    return res.status(400).json({ error: 'executive_id is required'
const getDateCondition = (period, dateColumn = 'created_at') => {
  switch (period) {
 });
  }

  try {
    // --- Trials (from trial_followups) ---
    //    case 'today':
      return `AND ${dateColumn} >= date_trunc('day', now()) AND ${date Counts ALL trials CREATED/INITIATED within the specified period by the executive,
    // regardless of their current isColumn} < (date_trunc('day', now()) + interval '1 day')`;
    case 'week_dropped status.
    const trialsTodayQuery = `SELECT COUNT(*)::int AS count FROM trial_follow':
      return `AND ${dateColumn} >= date_trunc('week', now()) AND ${dateColumn}ups WHERE executive_id=$1 ${getDateCondition('today', 'created_at')}`; // Removed 'is_dropped = < (date_trunc('week', now()) + interval '1 week')`;
    case 'month':
 false'
    const trialsWeekQuery = `SELECT COUNT(*)::int AS count FROM trial_followups WHERE      return `AND ${dateColumn} >= date_trunc('month', now()) AND ${dateColumn} < ( executive_id=$1 ${getDateCondition('week', 'created_at')}`;   // Removed 'is_dropped = falsedate_trunc('month', now()) + interval '1 month')`;
    default:
      console.warn'
    const trialsMonthQuery = `SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive(`getDateCondition called with unrecognized period: ${period}. Returning empty condition.`);
      return '';
  }
};

_id=$1 ${getDateCondition('month', 'created_at')}`; // Removed 'is_dropped = false'router.get('/', async (req, res) => {
  const execId = req.query.executive_

    // --- Subscribed/Converted (from subscribed_clients table) ---
    // Counts clients newly subscribed/converted byid;
  if (!execId) {
    return res.status(400).json({ error the executive within the period.
    const subscribedTodayQuery = `SELECT COUNT(*)::int AS count FROM subscribed: 'executive_id is required' });
  }

  try {
    // --- Trials (from trial__clients WHERE executive_id=$1 ${getDateCondition('today', 'converted_on')}`;
    const subscribedfollowups) ---
    // Counts ALL trials initiated (created) within the specified period by the executive,
    // regardlessWeekQuery = `SELECT COUNT(*)::int AS count FROM subscribed_clients WHERE executive_id=$1 ${getDate of their current is_dropped status.
    const trialsTodayQuery = `SELECT COUNT(*)::int AS countCondition('week', 'converted_on')}`;
    const subscribedMonthQuery = `SELECT COUNT(*)::int FROM trial_followups WHERE executive_id=$1 ${getDateCondition('today', 'created_at')}`; // AS count FROM subscribed_clients WHERE executive_id=$1 ${getDateCondition('month', 'converted_on')}`; Removed "AND is_dropped = false"
    const trialsWeekQuery = `SELECT COUNT(*)::int AS count FROM trial

    // --- Unsubscribed/Dropped (from unsubscribed_clients table) ---
    // Counts clients newly unsubscribed by the executive within the period.
    const droppedTodayQuery = `SELECT COUNT(*)::int AS count FROM unsubscribed_clients WHERE_followups WHERE executive_id=$1 ${getDateCondition('week', 'created_at')}`;   // Removed "AND executive_id=$1 ${getDateCondition('today', 'unsubscribed_at')}`;
    const droppedWeekQuery is_dropped = false"
    const trialsMonthQuery = `SELECT COUNT(*)::int AS count FROM trial_followups WHERE executive_id=$1 ${getDateCondition('month', 'created_at')}`; // Removed " = `SELECT COUNT(*)::int AS count FROM unsubscribed_clients WHERE executive_id=$1 ${getDateConditionAND is_dropped = false"

    // --- Subscribed/Converted (from subscribed_clients table) ---
('week', 'unsubscribed_at')}`;
    const droppedMonthQuery = `SELECT COUNT(*)::int    // Counts clients newly subscribed/converted by the executive within the period.
    const subscribedTodayQuery = `SELECT AS count FROM unsubscribed_clients WHERE executive_id=$1 ${getDateCondition('month', 'unsubscribed_at COUNT(*)::int AS count FROM subscribed_clients WHERE executive_id=$1 ${getDateCondition('today', '')}`;
    
    // --- Revenue (from payments table) ---
    // Sums payment_amount forconverted_on')}`;
    const subscribedWeekQuery = `SELECT COUNT(*)::int AS count FROM subscribed_ payments captured within the period by the executive.
    const revenueTodayQuery = `SELECT COALESCE(SUM(clients WHERE executive_id=$1 ${getDateCondition('week', 'converted_on')}`;
    const subscribedMonthpayment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$1 ${getDateCondition('today', 'capturedQuery = `SELECT COUNT(*)::int AS count FROM subscribed_clients WHERE executive_id=$1 ${getDateCondition_at')}`;
    const revenueWeekQuery = `SELECT COALESCE(SUM(payment_amount),0('month', 'converted_on')}`;

    // --- Unsubscribed/Dropped (from unsubscribed_clients table)::numeric AS sum FROM payments WHERE executive_id=$1 ${getDateCondition('week', 'captured_at')) ---
    // Counts clients newly unsubscribed by the executive within the period.
    const droppedTodayQuery =}`;
    const revenueMonthQuery = `SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$1 ${getDateCondition('month', 'captured_at')}`;

     `SELECT COUNT(*)::int AS count FROM unsubscribed_clients WHERE executive_id=$1 ${getDateCondition('today', 'unsubscribed_at')}`;
    const droppedWeekQuery = `SELECT COUNT(*)::int AS count FROM unsubconst [
      trialsDayRes, trialsWeekRes, trialsMonthRes,
      subsDayRes, subsWeekscribed_clients WHERE executive_id=$1 ${getDateCondition('week', 'unsubscribed_at')}`;
    Res, subsMonthRes,
      dropsDayRes, dropsWeekRes, dropsMonthRes,
      revDayRes, revWeekRes, revMonthRes
    ] = await Promise.all([
      pool.query(const droppedMonthQuery = `SELECT COUNT(*)::int AS count FROM unsubscribed_clients WHERE executive_id=$trialsTodayQuery, [execId]),
      pool.query(trialsWeekQuery, [execId]),
      1 ${getDateCondition('month', 'unsubscribed_at')}`;
    
    // --- Revenue (from payments table) ---pool.query(trialsMonthQuery, [execId]),

      pool.query(subscribedTodayQuery, [execId]),

    // Sums payment_amount for payments captured within the period by the executive.
    const revenueTodayQuery = `      pool.query(subscribedWeekQuery, [execId]),
      pool.query(subscribedMonthQuery, [SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$execId]),

      pool.query(droppedTodayQuery, [execId]),
      pool.query(dropped1 ${getDateCondition('today', 'captured_at')}`;
    const revenueWeekQuery = `SELECT COALESWeekQuery, [execId]),
      pool.query(droppedMonthQuery, [execId]),

      poolCE(SUM(payment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$1 ${getDateCondition('week.query(revenueTodayQuery, [execId]),
      pool.query(revenueWeekQuery, [execId', 'captured_at')}`;
    const revenueMonthQuery = `SELECT COALESCE(SUM(payment_amount),0)::numeric AS sum FROM payments WHERE executive_id=$1 ${getDateCondition('month', 'captured_]),
      pool.query(revenueMonthQuery, [execId]),
    ]);

    res.json({
      trials: {
        today: trialsDayRes.rows[0]?.count || 0,
        at')}`;

    const [
      trialsDayRes, trialsWeekRes, trialsMonthRes,
      subsweek: trialsWeekRes.rows[0]?.count || 0,
        month: trialsMonthRes.rowsDayRes, subsWeekRes, subsMonthRes,
      dropsDayRes, dropsWeekRes, dropsMonthRes[0]?.count || 0,
      },
      converted: { // "Subscribed" in UI
,
      revDayRes, revWeekRes, revMonthRes
    ] = await Promise.all([
        today: subsDayRes.rows[0]?.count || 0,
        week: subsWeekRes.      pool.query(trialsTodayQuery, [execId]),
      pool.query(trialsWeekQuery, [rows[0]?.count || 0,
        month: subsMonthRes.rows[0]?.count || execId]),
      pool.query(trialsMonthQuery, [execId]),

      pool.query(subscribed0,
      },
      dropped: { // "Unsubscribed" in UI
        today: dropsDayResTodayQuery, [execId]),
      pool.query(subscribedWeekQuery, [execId]),
      pool.rows[0]?.count || 0,
        week: dropsWeekRes.rows[0]?.count ||.query(subscribedMonthQuery, [execId]),

      pool.query(droppedTodayQuery, [execId 0,
        month: dropsMonthRes.rows[0]?.count || 0,
      },
]),
      pool.query(droppedWeekQuery, [execId]),
      pool.query(droppedMonthQuery      revenue: {
        today: parseFloat(revDayRes.rows[0]?.sum || 0),
, [execId]),

      pool.query(revenueTodayQuery, [execId]),
      pool.query        week: parseFloat(revWeekRes.rows[0]?.sum || 0),
        month: parseFloat((revenueWeekQuery, [execId]),
      pool.query(revenueMonthQuery, [execId]),
revMonthRes.rows[0]?.sum || 0),
      },
    });
  } catch (err) {
    console.error('❌ Dashboard error:', err.message, err.stack);
    res    ]);

    res.json({
      trials: {
        today: trialsDayRes.rows[0]?.count || 0,
        week: trialsWeekRes.rows[0]?.count || 0,
.status(500).json({ error: 'Internal server error', details: err.message });
          month: trialsMonthRes.rows[0]?.count || 0,
      },
      converted: {}
});

export default router;
// --- END OF FILE dashboard.js ---