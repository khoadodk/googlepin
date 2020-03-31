import React, { useContext } from "react";
import { GoogleLogout } from "react-google-login";
import { withStyles } from "@material-ui/core/styles";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

import Context from "../../context";

const Signout = ({ classes }) => {
  const { dispatch } = useContext(Context);
  const onSignOut = () => {
    dispatch({ type: "SIGNOUT_USER" });
    console.log("Signout User");
  };

  return (
    <GoogleLogout
      onLogoutSuccess={onSignOut}
      render={({ onClick }) => (
        <span className={classes.root} onClick={onClick}>
          Sign Out
          <ExitToAppIcon className={classes.buttonIcon} />
        </span>
      )}
    />
  );
};

const styles = {
  root: {
    cursor: "pointer",
    display: "flex"
  },
  buttonIcon: {
    marginLeft: "5px"
  }
};

export default withStyles(styles)(Signout);
