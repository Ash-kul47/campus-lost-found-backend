const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();
const {
    registerValidation,
    validate
} = require("../validators/authValidator");

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Login with Google
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirect to Google
 */
router.get(
    "/google",

    passport.authenticate(
        "google",
        {
            scope: ["profile", "email"]
        }
    )
);
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Google login successful
 */
router.get(
    "/google/callback",

    passport.authenticate(
        "google",
        {
            session:false,
            failureRedirect:"/register-page"
        }
    ),

    async (req,res)=>{

        const token = jwt.sign(
            {
                id:req.user._id,
                role:req.user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn:"7d"
            }
        );

        res.json({
            message:"Google Login Successful",
            token,
            user:req.user
        });

    }
);

module.exports = router;