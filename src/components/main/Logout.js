import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Logout({ visible, onClose, onLogout }) {
  const [open, setIsOpen] = useState(false);
  const auth = useAuth();
  const history = useHistory();

  useEffect(() => {
    setIsOpen(!!visible);
  }, [visible]);

  function logout() {
    auth.logout().then(() => history.push("/login"));
  }

  return (
    <Dialog onClose={onClose} aria-labelledby="logout-dialog" open={open}>
      <DialogTitle id="alertlogout">Confirm Logout</DialogTitle>
      <DialogContent>
        <DialogContentText id="alertlogoutdescription">
          Are you sure you want to logout?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          No
        </Button>
        <Button onClick={logout} color="primary" autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
