const axios = require('axios');
const ErrorHandler = require('./errorHandler');

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const SECRET_KEY = process.env.PAYPAL_SECRET_ID;

const paypalURL = {
  'development': 'https://api-m.sandbox.paypal.com',
  'production': 'https://api-m.paypal.com'
};

const url = paypalURL[process.env.NODE_ENV];
console.log({ url });

const generateAccessToken = async () => {
  const body = 'grant_type=client_credentials';

  const authHeader = `Basic ${Buffer.from(`${CLIENT_ID}:${SECRET_KEY}`).toString('base64')}`;

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authHeader,
    },
  };

  try {
    const { data } = await axios.post(`${url}/v1/oauth2/token`, body, config);
    return data.access_token;
  } catch (err) {
    throw new ErrorHandler(err.message, 500);
  }
}

// use the orders api to create an order
exports.createOrder = async (amount) => {
  const access_token = await generateAccessToken();
  console.log({ access_token })

  const body = JSON.stringify({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "EUR",
          value: `${amount / 2}`,
        },
      },
    ],
  });
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    }
  };

  const { data } = await axios.post(`${url}/v2/checkout/orders`, body, config);
  console.log("inside create Order", { data })
  return data;
}

// use the orders api to capture payment for an order
exports.capturePayment = async (orderID) => {
  const access_token = await generateAccessToken();
  console.log({ access_token })

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    }
  };

  const { data } = await axios.post(`${url}/v2/checkout/orders/${orderID}/capture`, {}, config);

  return data;
}

exports.generateClientToken = async () => {
  const access_token = await generateAccessToken();

  const config = {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Accept-Language": "en_US",
      "Content-Type": "application/json",
    }
  }
  const { data } = await axios.post(`${url}/v1/identity/generate-token`, {}, config);

  return data;
};

