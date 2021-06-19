import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem
} from "@material-ui/core";
import { Container } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useHistory } from "react-router";
import { AiOutlineMenu } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import Logout from './Logout';
import SideDrawer from "./SideDrawer";
import Navbar from "./Navbar";

export default function Favourites() {
  const [contextMenu, setContextMenu] = useState(null);
  const [showLogOutDialog, setShowLogOutDialog] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const auth = useAuth();
  const history = useHistory();

  return (
    <>
      <AppBar
        position="fixed"
        style={{
          backgroundColor: "white",
          color: "black",
          boxShadow: "0px 0px 0px 0px",
        }}
        onClick={() => isDrawerOpen && setDrawerOpen(false)}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="open drawer" onClick={() => setDrawerOpen(true)}>
            <AiOutlineMenu />
          </IconButton>
          <Typography variant="h6" noWrap style={{ flexGrow: "1" }}>
            Favourites
          </Typography>

          <div>
            <IconButton
              aria-label="User account"
              edge="end"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={(event) => setContextMenu(event.currentTarget)}
            >
              <BsThreeDotsVertical />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={contextMenu}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={!!contextMenu}
              onClose={() => setContextMenu(null)}
            >
              <MenuItem onClick={() => { history.push("/myprofile")}}>My profile</MenuItem>
              <MenuItem onClick={() => { setContextMenu(null); setShowLogOutDialog(true)}}>Logout</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <SideDrawer visible={isDrawerOpen} onClose={() => setDrawerOpen(false)} logout={() => { setDrawerOpen(false); setShowLogOutDialog(true)}}/>
      <Logout visible={showLogOutDialog} onClose={() => setShowLogOutDialog(false)}/>
      <Container fluid style={{height: "100vh"}} onClick={() => setDrawerOpen(false)}>
      <Typography>*WIP*</Typography>
      </Container>
      <Navbar item={1} />
    </>
  );
}
