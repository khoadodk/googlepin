export default function reducer(state, action) {
  switch (action.type) {
    case "LOGIN_USER":
      return {
        ...state,
        currentUser: action.payload
      };
    case "IS_LOGGED_IN":
      return { ...state, isAuth: action.payload };
    case "SIGNOUT_USER":
      return { ...state, currentUser: null, isAuth: false };
    case "CREATE_DRAFT":
      return {
        ...state,
        draft: {
          latitude: 0,
          longitude: 0
        },
        currentPin: null
      };
    case "UPDATE_DRAFT_LOCATION":
      return { ...state, draft: action.payload };
    case "DELETE_DRAFT":
      return { ...state, draft: null };
    case "GET_PINS":
      return { ...state, pins: action.payload };
    // Create new pins and immediate add to the map
    case "CREATE_PINS":
      const newPin = action.payload;
      const prevPins = state.pins.filter(pin => pin._id !== newPin._id);
      return {
        ...state,
        pins: [...prevPins, newPin],
        currentPin: null
      };
    // select pin for popup
    case "SET_PIN":
      return {
        ...state,
        currentPin: action.payload,
        // not allow user to make new draft if there is a pop up
        draft: null
      };
    case "DELETE_PIN":
      const deletePin = action.payload;
      const filteredPins = state.pins.filter(pin => pin._id !== deletePin._id);
      // stop rerendering for all users when a pin is deleted
      if (state.currentPin) {
        const isCurrentPin = deletePin._id === state.currentPin._id;
        if (isCurrentPin) {
          return { ...state, pins: filteredPins, currentPin: null };
        }
      }
      return { ...state, pins: filteredPins };

    case "CREATE_COMMENT":
      const updatedCurrentPin = action.payload;
      // find and replace the pin with new comment in the array of pins
      const updatedPins = state.pins.map(pin =>
        pin._id === updatedCurrentPin._id ? updatedCurrentPin : pin
      );
      return { ...state, pins: updatedPins, currentPin: updatedCurrentPin };
    default:
      return state;
  }
}
