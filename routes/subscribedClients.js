// routes/subscribedClients.js
import express from 'express';
import pool from '../db.js'; // Or require('../db') if using CommonJS

const router = express.Router();

// GET /api/subscribed-clients
router.get('/', async (req, res) => {
    const {
        executive_id,
        startDate, // Expecting YYYY-MM-DD
        endDate,   // Expecting YYYY-MM-DD
        commodity,
        packageName
    } = req.query;

    if (!executive_id) {
        return res.status(400).json({ error: 'executive_id is required' });
    }

    try {
        let query = `
            SELECT 
                id, 
                client_id, 
                executive_id, 
                name, 
                mobile_number, 
                commodity, 
                package_name, 
                mrp, 
                offered_price, 
                payment_amount,
                subscription_start, 
                subscription_duration_days, 
                converted_on, 
                gst_option
            FROM subscribed_clients 
            WHERE executive_id = $1
        `;
        const queryParams = [executive_id];
        let paramIndex = 2; // Start param index after executive_id

        // Add date filtering (based on subscription_start date)
        if (startDate) {
            query += ` AND subscription_start >= $${paramIndex++}`;
            queryParams.push(startDate);
        }
        if (endDate) {
            // Add 1 day to endDate to make the range inclusive
             query += ` AND subscription_start < ($${paramIndex++}::date + interval '1 day')`;
             queryParams.push(endDate);
           // Or if you want exact date match:
           // query += ` AND subscription_start <= $${paramIndex++}`;
           // queryParams.push(endDate);
        }

        // Add commodity filtering
        if (commodity) {
            query += ` AND commodity = $${paramIndex++}`;
            queryParams.push(commodity);
        }

        // Add package name filtering
        if (packageName) {
            query += ` AND package_name = $${paramIndex++}`;
            queryParams.push(packageName);
        }

        query += ` ORDER BY subscription_start DESC, converted_on DESC`;

        console.log("Executing query:", query, queryParams); // For debugging

        const result = await pool.query(query, queryParams);

        // Fetch distinct commodities and package names for filter dropdowns
        // Filters based ONLY on the executive, not other filters, to show all possible options for that exec
        const commodityOptionsQuery = `SELECT DISTINCT commodity FROM subscribed_clients WHERE executive_id = $1 AND commodity IS NOT NULL ORDER BY commodity`;
        const packageOptionsQuery = `SELECT DISTINCT package_name FROM subscribed_clients WHERE executive_id = $1 AND package_name IS NOT NULL ORDER BY package_name`;

        const [commodityOptionsRes, packageOptionsRes] = await Promise.all([
            pool.query(commodityOptionsQuery, [executive_id]),
            pool.query(packageOptionsQuery, [executive_id])
        ]);

        res.status(200).json({
            clients: result.rows,
            filterOptions: {
                commodities: commodityOptionsRes.rows.map(r => r.commodity),
                packages: packageOptionsRes.rows.map(r => r.package_name)
            }
        });

    } catch (error) {
        console.error('❌ Error fetching subscribed clients:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to fetch subscribed clients', details: error.message });
    }
});

// Use module.exports = router; if using CommonJS
export default router;