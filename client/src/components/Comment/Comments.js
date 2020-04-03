import React, { useContext } from "react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";
import Button from "@material-ui/core/Button";

import format from "date-fns/format";
import Context from "../../context";
import { useClient } from "../../clientHook";
import { DELETE_COMMENT_MUTATION } from "../../graphql/mutations";

const Comments = ({ classes, comments }) => {
  const client = useClient();
  const { state, dispatch } = useContext(Context);

  const isCommentOwner = () =>
    comments.map(comment => state.currentUser._id === comment.author._id);

  const handleDeleteComment = async comment => {
    const { deleteComment } = await client.request(DELETE_COMMENT_MUTATION, {
      commentId: comment._id,
      pinId: state.currentPin._id
    });

    dispatch({
      type: "DELETE_COMMENT",
      payload: deleteComment
    });
  };

  return (
    <List className={classes.root}>
      {comments.map((comment, i) => (
        <ListItem key={i} alignItems="flex-start">
          <ListItemAvatar>
            <Avatar src={comment.author.picture} alt={comment.author.name} />
          </ListItemAvatar>
          <ListItemText
            primary={comment.text}
            secondary={
              <>
                <Typography className={classes.inline} component="span">
                  {comment.author.name}
                </Typography>
                &nbsp; {format(Number(comment.createdAt), "MMM Do, YYYY")}
              </>
            }
          />
          {isCommentOwner() && (
            <Button onClick={() => handleDeleteComment(comment)}>
              <DeleteIcon className={classes.deleteIcon} />
            </Button>
          )}
        </ListItem>
      ))}
    </List>
  );
};

const styles = theme => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  inline: {
    display: "inline"
  },
  deleteIcon: {
    color: "red"
  }
});

export default withStyles(styles)(Comments);
