import React, { useState, useEffect, useContext } from "react";
import ReactMapGL, { NavigationControl, Marker, Popup } from "react-map-gl";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";
import differenceInMinutes from "date-fns/difference_in_minutes";
import { Subscription } from "react-apollo";
import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery";

import PinIcon from "./PinIcon";
import Context from "../context";
import Blog from "./Blog";

import { useClient } from "../clientHook";
import { GET_PINS_QUERY } from "../graphql/queries";
import { DELETE_PIN_MUTATION } from "../graphql/mutations";
import {
  PIN_ADDED_SUBSCRIPTION,
  PIN_DELETED_SUBSCRIPTION,
  PIN_UPDATED_SUBSCRIPTION
} from "../graphql/subscriptions";

const INITIAL_VIEWPORT = {
  latitude: 35.7804,
  longitude: -78.6391,
  zoom: 13
};

const Map = ({ classes }) => {
  const client = useClient();
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [userPosition, setUserPosition] = useState(null);
  const { state, dispatch } = useContext(Context);
  const [popup, setPopup] = useState(null);
  const mobileSize = useMediaQuery("(max-width: 650px)");

  useEffect(() => {
    getUserPosition();
    getPins();
  }, []);

  const getUserPosition = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        // console.log("COORDINATE", position.coords);
        const { latitude, longitude } = position.coords;
        setViewport({ ...viewport, latitude, longitude });
        setUserPosition({ latitude, longitude });
      });
    }
  };

  const getPins = async () => {
    const { getPins } = await client.request(GET_PINS_QUERY);
    // Get the pins from graphql query and dispatch
    // console.log(getPins);
    dispatch({ type: "GET_PINS", payload: getPins });
  };

  const handleMapClick = ({ lngLat, leftButton }) => {
    // console.log(event);
    if (!leftButton) return;
    // persist the draft on the map so when we click to the new draft while on the current pin, it does not make an error
    // the draft's initial location set to lng:0,lat:0
    if (!state.draft) {
      dispatch({ type: "CREATE_DRAFT" });
    }
    // console.log(lngLat);
    // BEWARE HERE, LONG and LAT are switched
    dispatch({
      type: "UPDATE_DRAFT_LOCATION",
      payload: { latitude: lngLat[1], longitude: lngLat[0] }
    });
  };

  const highlightNewPin = pin => {
    // check if the new pin is created within 30 min
    const isNewPin = differenceInMinutes(Date.now(), +pin.createdAt) <= 30;
    return isNewPin ? "limegreen" : "darkblue";
  };

  const handleSelectPin = pin => {
    setPopup(pin);
    dispatch({ type: "SET_PIN", payload: pin });
  };

  const handleDeletePin = async popup => {
    const { deletePin } = await client.request(DELETE_PIN_MUTATION, {
      pinId: popup._id
    });
    // dispatch({ type: "DELETE_PIN", payload: deletePin });
    setPopup(null);
  };

  // Allow user to delete their pins
  const isAuthUser = () => state.currentUser._id === popup.author._id;
  return (
    <div className={mobileSize ? classes.rootMobile : classes.root}>
      <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxApiAccessToken="pk.eyJ1IjoiZGtraG9hIiwiYSI6ImNrM2RyMjNkbzExZ28zZHFlejBhcDMwZzQifQ.CXb5k5BjgR3qMlJcVgevBQ"
        onViewportChange={viewport => setViewport(viewport)}
        {...viewport}
        onClick={handleMapClick}
        scrollZoom={!mobileSize}
      >
        {/* Navigation Control */}
        <div className={classes.navigationControl}>
          <NavigationControl
            onViewportChange={viewport => setViewport(viewport)}
          />
        </div>

        {/* Pin for user's current position */}
        {userPosition && (
          <Marker
            latitude={userPosition.latitude}
            longitude={userPosition.longitude}
          >
            <PinIcon size={40} color="red" />
          </Marker>
        )}

        {/* Draft Pin */}
        {state.draft && (
          <Marker
            latitude={state.draft.latitude}
            longitude={state.draft.longitude}
          >
            <PinIcon size={40} color="hotpink" />
          </Marker>
        )}

        {/* Show all pins to map */}
        {state.pins.map(pin => (
          <Marker
            key={pin._id}
            latitude={pin.latitude}
            longitude={pin.longitude}
          >
            <PinIcon
              size={40}
              color={highlightNewPin(pin)}
              onClick={() => handleSelectPin(pin)}
            />
          </Marker>
        ))}

        {/* Pop up dialog for created pins */}
        {popup && (
          <Popup
            anchor="top"
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <img
              className={classes.popupImage}
              src={popup.image}
              alt={popup.title}
            />
            <div className={classes.popupTab}>
              <Typography>
                {popup.latitude.toFixed(6)}, {popup.longitude.toFixed(6)}
              </Typography>
              {isAuthUser() && (
                <Button onClick={() => handleDeletePin(popup)}>
                  <DeleteIcon className={classes.deleteIcon} />
                </Button>
              )}
            </div>
          </Popup>
        )}
      </ReactMapGL>

      {/* Subscription for added/updateed/deleted pins */}
      <Subscription
        subscription={PIN_ADDED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinAdded } = subscriptionData.data;
          console.log("PIN ADDED", pinAdded);
          dispatch({ type: "CREATE_PINS", payload: pinAdded });
        }}
      />
      <Subscription
        subscription={PIN_UPDATED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinUpdated } = subscriptionData.data;
          console.log("PIN UPDATED", pinUpdated);
          dispatch({ type: "CREATE_COMMENT", payload: pinUpdated });
        }}
      />
      <Subscription
        subscription={PIN_DELETED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinDeleted } = subscriptionData.data;
          console.log("PIN DELETED", pinDeleted);
          dispatch({ type: "DELETE_PIN", payload: pinDeleted });
        }}
      />

      {/* Blog area to add pin content */}
      <Blog />
    </div>
  );
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);
