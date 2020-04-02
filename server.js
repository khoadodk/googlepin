const { ApolloServer } = require("apollo-server");

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const mongoose = require("mongoose");
require("dotenv").config();

const { findOrCreateUser } = require("./controllers/userController");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log("---MongoDB connected!---"))
  .catch(err => console.error(err));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //   get token from the headers
  context: async ({ req }) => {
    let authToken = null;
    let currentUser = null;
    try {
      authToken = req.headers.authorization;
      if (authToken) {
        // find or create new user
        currentUser = await findOrCreateUser(authToken);
      }
    } catch (err) {
      console.log(`Unable to authenticate user with token ${authToken}`);
    }
    // send user to resolver
    return { currentUser };
  }
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server is listening on ${url}`);
});
