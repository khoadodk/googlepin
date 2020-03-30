// dummy user
const user = {
  _id: "1",
  name: "Khoa",
  email: "khoado.dk@gmail.com",
  picture: ""
};

module.exports = {
  Query: {
    me: () => user
  }
};
