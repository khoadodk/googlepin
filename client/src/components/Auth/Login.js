import React from "react";
import { GoogleLogin } from "react-google-login";
import { GraphQLClient } from "graphql-request";
import { withStyles } from "@material-ui/core/styles";
// import Typography from "@material-ui/core/Typography";

const ME_QUERY = `{
  me {
    _id
    name
    email
    picture
  }
}`;

const Login = ({ classes }) => {
  const onSuccess = async googleUser => {
    // Grab the Oauth token
    const idToken = googleUser.getAuthResponse().id_token;
    // Send it to the server
    const client = new GraphQLClient("http://localhost:4000/graphql", {
      headers: { authorization: idToken }
    });
    const data = await client.request(ME_QUERY);
    console.log(data);
  };

  return (
    <GoogleLogin
      clientId="659726176561-fsnlg5uq75kjl4f83nk597a01e77177l.apps.googleusercontent.com"
      onSuccess={onSuccess}
      isSignedIn={true}
    />
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
