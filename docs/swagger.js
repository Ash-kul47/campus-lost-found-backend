const swaggerJsDoc = require("swagger-jsdoc");

const options = {

    definition: {

        openapi: "3.0.0",

        info: {
            title: "Lost & Found API",
            version: "1.0.0",
            description: "Campus Lost & Found Backend API"
        },

        servers: [
            {
                url: "http://localhost:3000"
            }
        ],

        components: {

            securitySchemes: {

                bearerAuth: {

                    type: "http",

                    scheme: "bearer",

                    bearerFormat: "JWT"

                }

            }

        },

        security: [

            {
                bearerAuth: []
            }

        ]

    },

    apis: ["./routes/*.js"]

};

module.exports = swaggerJsDoc(options);