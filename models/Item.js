const mongoose=require('mongoose');

const itemSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true,
        trim:true
    },

    description:{
        type:String,
        required:true
    },

    type:{
        type:String,
        enum:["LOST","FOUND"],
        required:true
    },

    category:{
        type:String,
        enum:[
            "ELECTRONICS",
            "KEYS",
            "WALLET",
            "DOCUMENTS",
            "BAGS",
            "ID_CARD",
            "BOOKS",
            "CLOTHING",
            "OTHERS"
        ]
        

    },

    location:{
        type:String,
        required:true
    },

    dateLostFound:{
        type:Date,
        required:true
    },

    images:[
        {
            type:String
        }
    ],

    status:{
        type:String,
        enum:[
            "OPEN",
            "CLAIM_PENDING",
            "RETURNED",
            "REMOVED"
        ],
        default:"OPEN"
    },

    reportedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    custodyType:{
        type:String,
        enum:["STUDENT","DEPARTMENT"],
        default:"STUDENT"
    },

    currentHolder:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
}

},
{
    timestamps:true
});
module.exports = mongoose.model("Item", itemSchema);