const { AuthenticationError, PubSub } = require("apollo-server");
const Pin = require("./models/Pin");

const pubsub = new PubSub();
const PIN_ADDED = "PIN_ADDED";
const PIN_UPDATED = "PIN_UPDATED";
const PIN_DELETED = "PIN_DELETED";

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
      // publish for realtime update
      pubsub.publish(PIN_ADDED, { pinAdded });

      return pinAdded;
    }),
    deletePin: authenticated(async (root, args, ctx) => {
      const pinDeleted = await Pin.findByIdAndDelete({
        _id: args.pinId
      }).exec();
      // publish for realtime update
      pubsub.publish(PIN_DELETED, { pinDeleted });

      return pinDeleted;
    }),
    createComment: authenticated(async (root, args, ctx) => {
      const newComment = { text: args.text, author: ctx.currentUser._id };
      const pinUpdated = await Pin.findOneAndUpdate(
        { _id: args.pinId },
        { $push: { comments: newComment } },
        { new: true }
      )
        .populate("author")
        .populate("comments.author");
      // publish for realtime update
      pubsub.publish(PIN_UPDATED, { pinUpdated });

      return pinUpdated;
    }),
    deleteComment: authenticated(async (root, args, ctx) => {
      const pinUpdated = await Pin.findOneAndUpdate(
        { _id: args.pinId },
        { $pull: { comments: { _id: args.commentId } } },
        { new: true }
      )
        .populate("author")
        .populate("comments.author");
      return pinUpdated;
    })
  },
  Subscription: {
    pinAdded: { subscribe: () => pubsub.asyncIterator(PIN_ADDED) },
    pinUpdated: { subscribe: () => pubsub.asyncIterator(PIN_UPDATED) },
    pinDeleted: { subscribe: () => pubsub.asyncIterator(PIN_DELETED) }
  }
};
