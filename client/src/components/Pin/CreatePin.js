import React, { useState, useContext } from "react";
import { GraphQLClient } from "graphql-request";
import axios from "axios";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddAPhotoIcon from "@material-ui/icons/AddAPhotoTwoTone";
import LandscapeIcon from "@material-ui/icons/LandscapeOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/SaveTwoTone";

import Context from "../../context";
import { CREATE_PIN_MUTATION } from "../../graphql/mutations";
import { useClient } from "../../clientHook";

const CreatePin = ({ classes }) => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const { state, dispatch } = useContext(Context);
  const [submitting, setSubmitting] = useState(false);

  const client = useClient();

  const handleDeleteDraft = () => {
    setTitle("");
    setImage("");
    setContent("");
    // remove pin
    dispatch({ type: "DELETE_DRAFT" });
  };

  const handleImageUpload = async () => {
    const data = new FormData();
    // file type
    data.append("file", image);
    // tag the file set on cloudinary
    data.append("upload_preset", "google-pins");
    data.append("cloud-name", "dzb0zeepp");
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/dzb0zeepp/image/upload",
      data
    );
    return res.data.url;
  };

  const handleSubmit = async event => {
    try {
      event.preventDefault();
      setSubmitting(true);
      const imageUrl = await handleImageUpload();
      // console.log({ title, image, imageUrl, content });
      // sent the data to the graphql
      const { longitude, latitude } = state.draft;
      const { createPin } = await client.request(CREATE_PIN_MUTATION, {
        title,
        image: imageUrl,
        content,
        latitude,
        longitude
      });
      handleDeleteDraft();
      // console.log("PIN CREATED", createPin);
      // dispatch({ type: "CREATE_PINS", payload: createPin });
    } catch (err) {
      setSubmitting(false);
      console.error("Error creating pin", err);
    }
  };

  return (
    <form className={classes.form}>
      <Typography
        className={classes.alignCenter}
        component="h2"
        variant="h4"
        color="secondary"
      >
        <LandscapeIcon className={classes.iconLarge} />
        Pin Location
      </Typography>
      <TextField
        name="title"
        label="Title"
        placeholder="Insert pin title"
        onChange={e => setTitle(e.target.value)}
      />
      <input
        accept="image/*"
        id="image"
        type="file"
        className={classes.input}
        onChange={e => setImage(e.target.files[0])}
      />
      <label htmlFor="image">
        <Button component="span" size="small" className={classes.button}>
          <AddAPhotoIcon />
        </Button>
      </label>
      <div className={classes.contentField}>
        <TextField
          name="content"
          label="Content"
          multiline
          rows="6"
          margin="normal"
          fullWidth
          variant="outlined"
          onChange={e => setContent(e.target.value)}
        />
      </div>
      <div>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          onClick={handleDeleteDraft}
        >
          <ClearIcon className={classes.leftIcon} />
          Discard
        </Button>
        <Button
          className={classes.button}
          variant="contained"
          color="primary"
          type="submit"
          disabled={!title.trim() || !content.trim() || !image || submitting}
          onClick={handleSubmit}
        >
          Submit
          <SaveIcon className={classes.rightIcon} />
        </Button>
      </div>
    </form>
  );
};

const styles = theme => ({
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: theme.spacing.unit
  },
  contentField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "95%"
  },
  input: {
    display: "none"
  },
  alignCenter: {
    display: "flex",
    alignItems: "center"
  },
  iconLarge: {
    fontSize: 40,
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    fontSize: 20,
    marginLeft: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
    marginLeft: 0
  }
});

export default withStyles(styles)(CreatePin);
