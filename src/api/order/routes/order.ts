'use strict';
// @ts-ignore
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * order router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::order.order');

module.exports = {
    routes: [
        {
            method: "POST",
            path: "/orders/payment",
            handler: "order.setUpStripe",
            config: {
                "policies": []
            }
        }
    ]
}