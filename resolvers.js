const { AuthenticationError } = require("apollo-server");
const Pin = require("./models/Pin");

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
    me: authenticated((root, args, ctx) => ctx.currentUser),
    getPins: async (root, args, ctx) => {
      const pins = await Pin.find()
        .populate("author")
        .populate("comments.author");
      return pins;
    }
  },
  Mutation: {
    createPin: authenticated(async (root, args, ctx) => {
      const newPin = await new Pin({
        ...args.input,
        // passs the current user to author from context
        author: ctx.currentUser
      }).save();
      const pinAdded = await Pin.populate(newPin, "author");
      return pinAdded;
    })
  }
};
