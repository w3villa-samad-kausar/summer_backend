require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.

const paymentIntent = async (req, res) => {
    // const amount=req.body.amount
    // console.log(typeof(amount))
    // Use an existing Customer ID if this is a returning customer.
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2024-06-20' }
    );
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: 'usd',
            customer: customer.id,
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter
            // is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.json({
            paymentIntent: paymentIntent,
            ephemeralKey: ephemeralKey,
            customer: customer.id,
        });

    } catch (error) {
        res.json({
            error: error.raw.code,
        })

    }
}

module.exports = paymentIntent