const express = require("express");
const router = express.Router();

const Item = require("../models/Item");
const Claim = require("../models/Claim");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");


// =========================================
// STUDENT DASHBOARD
// =========================================

/**
 * @swagger
 * /api/dashboard/student:
 *   get:
 *     summary: Student dashboard statistics
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard data
 */

router.get("/student", authMiddleware, async (req, res) => {

    try {

        const reportedItems = await Item.countDocuments({
            reportedBy: req.user.id
        });

        const lostItems = await Item.countDocuments({
            reportedBy: req.user.id,
            type: "LOST"
        });

        const foundItems = await Item.countDocuments({
            reportedBy: req.user.id,
            type: "FOUND"
        });

        const activeClaims = await Claim.countDocuments({
            claimant: req.user.id,
            status: "PENDING"
        });

        const returnedItems = await Item.countDocuments({
            reportedBy: req.user.id,
            status: "RETURNED"
        });

        res.status(200).json({

            reportedItems,
            lostItems,
            foundItems,
            activeClaims,
            returnedItems

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});


// =========================================
// ADMIN DASHBOARD
// =========================================

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Admin dashboard statistics
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data
 */
router.get("/admin", authMiddleware, async (req, res) => {

    try {

        if (
            req.user.role !== "ADMIN" &&
            req.user.role !== "SUPER_ADMIN"
        ) {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        const totalUsers = await User.countDocuments();

        const totalItems = await Item.countDocuments();

        const openItems = await Item.countDocuments({
            status: "OPEN"
        });

        const returnedItems = await Item.countDocuments({
            status: "RETURNED"
        });

        const pendingClaims = await Claim.countDocuments({
            status: "PENDING"
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayReports = await Item.countDocuments({
            createdAt: {
                $gte: today
            }
        });

        res.status(200).json({

            totalUsers,
            totalItems,
            openItems,
            returnedItems,
            pendingClaims,
            todayReports

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

module.exports = router;