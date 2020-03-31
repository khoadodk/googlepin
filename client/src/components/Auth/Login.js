import React, { useContext } from "react";
import { GoogleLogin } from "react-google-login";
import { GraphQLClient } from "graphql-request";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import Context from "../../context";
import { ME_QUERY } from "../../graphql/queries";

const Login = ({ classes }) => {
  const { dispatch } = useContext(Context);

  const onSuccess = async googleUser => {
    try {
      // Grab the Oauth token
      const idToken = googleUser.getAuthResponse().id_token;
      // Send it to the server
      const client = new GraphQLClient("http://localhost:4000/graphql", {
        headers: { authorization: idToken }
      });
      const data = await client.request(ME_QUERY);
      // console.log(data);
      dispatch({ type: "LOGIN_USER", payload: data.me });
    } catch (err) {
      onFailure(err);
    }
  };

  const onFailure = err => {
    console.error("Error Logging in !", err);
  };

  return (
    <div className={classes.root}>
      <Typography
        component="h1"
        variant="h3"
        gutterBottom
        noWrap
        style={{ color: "rgb(66, 133, 244)" }}
      >
        Welcome to Google Pin
      </Typography>
      <GoogleLogin
        clientId="659726176561-fsnlg5uq75kjl4f83nk597a01e77177l.apps.googleusercontent.com"
        onSuccess={onSuccess}
        onFailure={onFailure}
        isSignedIn={true}
        theme="dark"
      />
    </div>
  );
};

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
