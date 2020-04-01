import { createContext } from "react";

const context = createContext({
  currentUser: null,
  isAuth: false,
  draft: null,
  pins: []
});

export default context;
