const { AuthenticationError } = require("apollo-server");

// dummy user
const user = {
  _id: "1",
  name: "Khoa",
  email: "khoado.dk@gmail.com",
  picture: ""
};

const authenticated = next => (root, args, ctx, info) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError("You must be logged in !");
  }
  return next(root, args, ctx, info);
};

module.exports = {
  Query: {
    me: authenticated((root, args, ctx) => ctx.currentUser)
  }
};
