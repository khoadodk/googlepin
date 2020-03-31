const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.findOrCreateUser = async token => {
  // verify auth token
  const googleUser = await verifyAuthToken(token);
  // check if user exists
  const user = await checkIfUserExist(googleUser.email);
  //  if user exists, return them; else create a new user
  return user ? user : createNewUser(googleUser);
};

const verifyAuthToken = async token => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (err) {
    console.error("Error verifying oAuth token");
  }
};

const checkIfUserExist = async email => {
  const user = await User.findOne({ email }).exec();
  return user;
};

const createNewUser = user => {
  const { name, email, picture } = user;
  const newUser = new User({ name, email, picture }).save();
  return newUser;
};
