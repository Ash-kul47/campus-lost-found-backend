const express = require("express");
const router = express.Router();

const Item = require("../models/Item");
const authMiddleware =require("../middleware/authMiddleware");

const uploadToCloudinary =require("../utils/uploadToCloudinary");

const upload =require("../middleware/uploadMiddleware");
const Notification = require("../models/Notification");

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Report a lost or found item
 *     tags:
 *       - Items
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - category
 *               - location
 *               - dateLostFound
 *             properties:
 *               title:
 *                 type: string
 *                 example: Black Wallet
 *               description:
 *                 type: string
 *                 example: Lost near library.
 *               type:
 *                 type: string
 *                 enum: [LOST, FOUND]
 *               category:
 *                 type: string
 *                 enum: [ELECTRONICS, KEYS, WALLET, DOCUMENTS, BAGS, ID_CARD, BOOKS, CLOTHING, OTHERS]
 *               location:
 *                 type: string
 *                 example: Central Library
 *               dateLostFound:
 *                 type: string
 *                 format: date
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Item reported successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.post("/",authMiddleware,upload.single("image"),async(req,res)=>{
    try{
        const{title,description,type,category,location,dateLostFound}=req.body;
        
        let imageUrls = [];

        if (req.file) {

            const uploadedImage =
            await uploadToCloudinary(
            req.file.buffer
        );

        imageUrls.push(
        uploadedImage.secure_url
    );

    }

        const item=await Item.create({
            title,
            description,
            type,
            category,
            location,
            dateLostFound,
            images:imageUrls,


            reportedBy:req.user.id
        });
        await Notification.create({

            user:req.user.id,

            title:"Item Reported",

            message:`Your ${type} item "${title}" has been reported successfully.`

        });
        res.status(201).json({
            message:"Item Created Successfully",

            item
        });
        
    }catch(error){

            console.log(error);

            res.status(500).json({
                message:"Server Error"
            });
        }
    }
);

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all reported items
 *     tags:
 *       - Items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of items
 */
router.get("/", authMiddleware, async (req, res) => {

    try {

        const {
            search,
            type,
            category,
            location,
            status,
            page = 1,
            limit = 10
        } = req.query;

        const query = {};

        if (search) {
            query.title = {
                $regex: search,
                $options: "i"
            };
        }

        if (type) {
            query.type = type;
        }

        if (category) {
            query.category = category;
        }

        if (location) {
            query.location = {
                $regex: location,
                $options: "i"
            };
        }

        if (status) {
            query.status = status;
        }

        const items = await Item.find(query)
            .populate(
                "reportedBy",
                "name email department year"
            )
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalItems = await Item.countDocuments(query);

        res.status(200).json({

            totalItems,

            currentPage: Number(page),

            totalPages: Math.ceil(totalItems / limit),

            items

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});

router.get("/search", async(req,res)=>{

    try{

        const keyword =
            req.query.keyword;

        const items =
            await Item.find({

                $or:[
                    {
                        title:{
                            $regex:keyword,
                            $options:"i"
                        }
                    },

                    {
                        description:{
                            $regex:keyword,
                            $options:"i"
                        }
                    }
                ]

            });

        res.status(200).json(items);

    }
    catch(error){

        console.log(error);

        res.status(500).json({
            message:"Server Error"
        });

    }

});
/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get a single item by ID
 *     tags:
 *       - Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item details
 *       404:
 *         description: Item not found
 */
router.get("/:id",async(req,res)=>{
    try{
        const item=await Item.findById(req.params.id).populate(
            "reportedBy",
            "name email"
        );
        if(!item){
            return res.status(404).json({
                message:"Item not found"
            });
        }
        res.status(200).json(item);
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"server error"
        });
    }
})
/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an existing item
 *     tags:
 *       - Items
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
 *         description: Item updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Item not found
 */
router.put("/:id",authMiddleware,async(req,res)=>{
    try{
        const item=await Item.findById(req.params.id);

        if(!item){
            return res.status(404).json({
                message:"Item Not Found"
            });
        }
        if(item.reportedBy.toString()!==req.user.id && req.user.role !=="ADMIN"){
        return res.status(403).json({
            message:"Not Authorized"
        });
    }
    const updatedItem =
    await Item.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
            new:true,
            runValidators:true
        }

    );
    res.status(200).json({

    message:
        "Item Updated Successfully",

    updatedItem

});
    }catch(error){
        console.log(error);
        res.status(500).json({
            message:"Server Error"
        });
    }
    
})
/**
 * @swagger
 * /api/items/{id}/matches:
 *   get:
 *     summary: Find matching lost/found items
 *     tags:
 *       - Items
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
 *         description: Matching items with match score
 *       404:
 *         description: Item not found
 */
router.get("/:id/matches", authMiddleware, async (req, res) => {

    try {

        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found"
            });
        }

        // Opposite type
        const oppositeType = item.type === "LOST"
            ? "FOUND"
            : "LOST";

        // Date Range (±7 days)
        const startDate = new Date(item.dateLostFound);
        startDate.setDate(startDate.getDate() - 7);

        const endDate = new Date(item.dateLostFound);
        endDate.setDate(endDate.getDate() + 7);

        const matches = await Item.find({

    _id: { $ne: item._id },

    type: oppositeType,

    category: item.category,

    location: item.location,

    dateLostFound: {
        $gte: startDate,
        $lte: endDate
    },

    status: "OPEN"

}).populate(
    "reportedBy",
    "name email department year"
);

const scoredMatches = matches.map(match => {

    let score = 0;

    // Same category
    score += 40;

    // Same location
    score += 25;

    // Date similarity
    const daysDifference = Math.abs(
        (new Date(match.dateLostFound) - new Date(item.dateLostFound))
        / (1000 * 60 * 60 * 24)
    );

    score += Math.max(0, 20 - (daysDifference * 2));

    // Title similarity
    const itemWords = item.title.toLowerCase().split(" ");
    const matchWords = match.title.toLowerCase().split(" ");

    const commonWords = itemWords.filter(word =>
        matchWords.includes(word)
    );

    score += commonWords.length * 10;

    if (score > 100) score = 100;

    return {

        ...match.toObject(),

        matchScore: Math.round(score)

    };

});

scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

res.status(200).json({

    count: scoredMatches.length,

    matches: scoredMatches

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
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item
 *     tags:
 *       - Items
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
 *         description: Item deleted successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Item not found
 */
router.delete(
    "/:id",
    authMiddleware,

    async(req,res)=>{

        try{

            const item =
                await Item.findById(
                    req.params.id
                );

            if(!item){

                return res.status(404).json({
                    message:"Item not found"
                });

            }

            if(
                item.reportedBy.toString() !==
                req.user.id

                &&

                req.user.role !== "ADMIN"
            ){

                return res.status(403).json({
                    message:"Not Authorized"
                });

            }

            await Item.findByIdAndDelete(
                req.params.id
            );

            res.status(200).json({

                message:
                    "Item Deleted Successfully"

            });

        }
        catch(error){

            console.log(error);

            res.status(500).json({
                message:"Server Error"
            });

        }

    }
);

module.exports = router;