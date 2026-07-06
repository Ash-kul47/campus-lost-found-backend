const express = require("express");
const router = express.Router();

const Claim = require("../models/Claim");
const Item = require("../models/Item");

const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");

/**
 * @swagger
 * /api/claims:
 *   post:
 *     summary: Submit a claim for an item
 *     tags:
 *       - Claims
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *               proof:
 *                 type: string
 *     responses:
 *       201:
 *         description: Claim submitted successfully
 *       400:
 *         description: Invalid request
 */
router.post("/", authMiddleware, async (req, res) => {

    try {

        const { itemId, proof } = req.body;

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        // User cannot claim their own reported item
        if (item.reportedBy.toString() === req.user.id) {
            return res.status(400).json({
                message: "You cannot claim your own reported item."
            });
        }

        if (item.status === "RETURNED") {
            return res.status(400).json({
                message: "Item already returned"
            });
        }

        const existingClaim = await Claim.findOne({
            item: itemId,
            claimant: req.user.id,
            status: "PENDING"
        });

        if (existingClaim) {
            return res.status(400).json({
                message: "Claim already submitted"
            });
        }

        const claim = await Claim.create({

            item: itemId,

            claimant: req.user.id,

            proof

        });
        await Notification.create({

            user:item.reportedBy,

            title:"New Claim",

            message:`Someone has submitted a claim for your item "${item.title}".`

        });

        res.status(201).json({

            message: "Claim submitted successfully",

            claim

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});
/**
 * @swagger
 * /api/claims/my:
 *   get:
 *     summary: Get logged-in user's claims
 *     tags:
 *       - Claims
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's claims
 */
router.get("/my", authMiddleware, async (req, res) => {

    try {

        const claims = await Claim.find({
            claimant: req.user.id
        })
        .populate("item")
        .sort({ createdAt: -1 });

        res.status(200).json({
            count: claims.length,
            claims
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});
/**
 * @swagger
 * /api/claims/pending:
 *   get:
 *     summary: Get all pending claims (Admin)
 *     tags:
 *       - Claims
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending claims
 *       403:
 *         description: Access denied
 */
router.get("/pending", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        const claims = await Claim.find({
            status: "PENDING"
        })
        .populate(
            "item",
            "title category type status"
        )
        .populate(
            "claimant",
            "name email department year"
        )
        .sort({ createdAt: -1 });

        res.status(200).json({
            count: claims.length,
            claims
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});
/**
 * @swagger
 * /api/claims/{id}/approve:
 *   put:
 *     summary: Approve a claim (Admin)
 *     tags:
 *       - Claims
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Claim approved
 *       404:
 *         description: Claim not found
 */
router.put("/:id/approve", authMiddleware, async (req, res) => {

    try {

        // Only admin can approve
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        // Find claim
        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                message: "Claim not found"
            });
        }

        // Claim must still be pending
        if (claim.status !== "PENDING") {
            return res.status(400).json({
                message: "Claim already processed"
            });
        }

        // Approve claim
        claim.status = "APPROVED";
        await claim.save();

        await Notification.create({

            user:claim.claimant,

            title:"Claim Approved",

            message:"Congratulations! Your claim has been approved."

        });

        // Update item
        await Item.findByIdAndUpdate(
            claim.item,
            {
                status: "RETURNED",
                claimedBy: claim.claimant
            }
        );

        // Reject all other pending claims
        await Claim.updateMany(
            {
                item: claim.item,
                _id: { $ne: claim._id },
                status: "PENDING"
            },
            {
                status: "REJECTED",
                adminRemarks:
                    "Another claim has been approved."
            }
        );

        res.status(200).json({
            message: "Claim approved successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});
/**
 * @swagger
 * /api/claims/{id}/reject:
 *   put:
 *     summary: Reject a claim (Admin)
 *     tags:
 *       - Claims
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Claim rejected
 *       404:
 *         description: Claim not found
 */
router.put("/:id/reject", authMiddleware, async (req, res) => {

    try {

        if (req.user.role !== "ADMIN") {
            return res.status(403).json({
                message: "Access Denied"
            });
        }

        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                message: "Claim not found"
            });
        }

        if (claim.status !== "PENDING") {
            return res.status(400).json({
                message: "Claim already processed"
            });
        }

        claim.status = "REJECTED";

        claim.adminRemarks =
            req.body.adminRemarks || "Claim rejected by admin.";

        await claim.save();
        await Notification.create({

            user:claim.claimant,

            title:"Claim Rejected",

            message:"Your claim has been rejected."

        });

        res.status(200).json({
            message: "Claim rejected successfully",
            claim
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});
module.exports = router;