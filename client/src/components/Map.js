import React, { useState, useEffect, useContext } from "react";
import ReactMapGL, { NavigationControl, Marker } from "react-map-gl";
import { withStyles } from "@material-ui/core/styles";
// import Button from "@material-ui/core/Button";
// import Typography from "@material-ui/core/Typography";
// import DeleteIcon from "@material-ui/icons/DeleteTwoTone";

import PinIcon from "./PinIcon";
import Context from "../context";
import Blog from "./Blog";

import { useClient } from "../clientHook";
import { GET_PINS_QUERY } from "../graphql/queries";

const INITIAL_VIEWPORT = {
  latitude: 35.7804,
  longitude: -78.6391,
  zoom: 13
};

const Map = ({ classes }) => {
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [userPosition, setUserPosition] = useState(null);
  const { state, dispatch } = useContext(Context);
  const client = useClient();

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
    // console.log(lngLat);
    // BEWARE HERE, LONG and LAT are switched
    dispatch({
      type: "UPDATE_DRAFT_LOCATION",
      payload: { latitude: lngLat[1], longitude: lngLat[0] }
    });
  };

  return (
    <div className={classes.root}>
      <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxApiAccessToken="pk.eyJ1IjoiZGtraG9hIiwiYSI6ImNrM2RyMjNkbzExZ28zZHFlejBhcDMwZzQifQ.CXb5k5BjgR3qMlJcVgevBQ"
        onViewportChange={viewport => setViewport(viewport)}
        {...viewport}
        onClick={handleMapClick}
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
            <PinIcon size={40} color="darkblue" />
          </Marker>
        ))}
      </ReactMapGL>

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
