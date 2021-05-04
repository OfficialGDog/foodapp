import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
} from "@material-ui/core";
import { useAuth } from "../../context/AuthContext";
import { useHistory } from "react-router";
import { AiOutlineMenu } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import Navbar from "./Navbar";

export default function Favourites() {
  const [contextMenu, setContextMenu] = useState(null);
  const auth = useAuth();
  const history = useHistory();

  function logout() {
    auth.logout().then(() => history.push("/login"));
  }

  return (
    <>
      <AppBar
        position="fixed"
        style={{
          backgroundColor: "white",
          color: "black",
          boxShadow: "0px 0px 0px 0px",
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="open drawer">
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
              <MenuItem onClick={logout}>Sign Out</MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <div className="text-center">
        <Typography variant="h5" style={{ marginTop: "100px" }}>
          You don't have any favourites!
        </Typography>
      </div>
      <Navbar item={1} />
    </>
  );
}
