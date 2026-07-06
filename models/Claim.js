const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({

    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },

    claimant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    proof: {
        type: String,
        required: true
    },

    proofImages: [
        {
            type: String
        }
    ],

    status: {
        type: String,
        enum: [
            "PENDING",
            "APPROVED",
            "REJECTED"
        ],
        default: "PENDING"
    },

    adminRemarks: {
        type: String,
        default: ""
    }

},{
    timestamps:true
});

module.exports =
mongoose.model("Claim",claimSchema);