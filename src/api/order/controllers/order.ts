"use strict";
// @ts-ignore
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 *  order controller
 */
const { createCoreController } = require("@strapi/strapi").factories;

const emailService = strapi.plugins['email'].services.email;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
    async setUpStripe(ctx) {
        let total = 0;
        let validatedCart = [];

        const { cart } = ctx.request.body;

        if (!cart || !Array.isArray(cart)) {
            ctx.send({
                error: true,
                message: 'Invalid cart data',
            });
            return;
        }

        // console.log('---order-cart---', cart);

        await Promise.all(cart.map(async (cartItem) => {
            try {
                const potentialProducts = await strapi.entityService.findMany('api::font.font', {
                    populate: { font_values: true }
                });

                console.log('---potentialProducts---', potentialProducts);

                const validatedProducts = potentialProducts.filter(product =>
                    product.font_values && product.font_values.some(font => font.font_name === cartItem.font_name)
                );

                console.log('---validatedProducts---', validatedProducts);

                validatedProducts.forEach(product => {
                    const font = product.font_values.find(font => font.font_name === cartItem.font_name);
                    if (font) {
                        validatedCart.push({
                            family_name: product.family_name,
                            font_name: font.font_name,
                            singleWeightPrice: cartItem.singleWeightPrice
                        });
                        console.log('---validated-font---', font);
                    }
                });

            } catch (error) {
                console.error('Error while querying the database:', error);
                ctx.send({
                    error: true,
                    message: 'Error querying the database',
                    details: error.message,
                });
                return;
            }
        }));

        console.log('---validatedCart---', validatedCart);

        total = validatedCart.reduce((n, { singleWeightPrice }) => {
            console.log('---singleWeightPrice---', singleWeightPrice);
            return n + (singleWeightPrice || 0);
        }, 0) * 100;

        console.log('---total---', total);

        if (total <= 0) {
            ctx.send({
                error: true,
                message: 'Total amount must be greater than zero',
            });
            return;
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: total,
                currency: 'usd',
                metadata: {
                    cart: JSON.stringify(validatedCart.map(item => ({
                        font_name: item.font_name,
                    })))
                },
                payment_method_types: ['card']
            });

            await sendOrderConfirmationEmail(cart);

            ctx.send({
                message: 'Payment intent created successfully',
                paymentIntent,
            });
        } catch (error) {
            console.error('Error in processing payment:', error);
            ctx.send({
                error: true,
                message: 'Error in processing payment',
                details: error.message,
            });
        }
    }
}));

async function sendOrderConfirmationEmail(cart) {
    try {
        const cartItems = cart.map(font => {
            const name = font.font_name ?? 'N/A';
            const price = font.price ?? 'N/A';
            const link = font.font_link;

            return `
                <li>
                    <strong>Name:</strong> ${name}<br>
                    <strong>Price:</strong> ${price}<br>
                    <a href="${link}">${name}</a>
                </li>`;
        });

        const emailMessage = `
            <p>Your order has been placed successfully.</p>
            <p>Ordered Items:</p>
            <ul>
                ${cartItems.join('')}
            </ul>`;

        await emailService.send({
            to: 'info@moretype.co.uk',
            from: 'chris@moretype.co.uk',
            replyTo: 'info@moretype.co.uk',
            subject: 'Order Confirmation',
            html: emailMessage
        });
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
}