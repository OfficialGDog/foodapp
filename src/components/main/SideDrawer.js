import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { VscFeedback } from "react-icons/vsc";
import { RiLogoutCircleLine } from "react-icons/ri";
import { IoPersonOutline } from "react-icons/io5";
import { BsSearch, BsInfoCircle, BsHeart } from "react-icons/bs";
import {
  Typography,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { ChevronLeft } from "@material-ui/icons";
import { Image } from "react-bootstrap";
import logo from "../../logo.jpg";

export default function SideDrawer({ visible, logout, onClose }) {
  const [open, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const history = useHistory();

  useEffect(() => {
    switch (history.location.pathname) {
      case "/":
        return setSelected(0);
      case "/myfavourites":
        return setSelected(1);
      case "/myprofile":
        return setSelected(2);
      case "/about":
        return setSelected(3);
      default:
        return;
    }
  }, []);

  useEffect(() => {
    setIsOpen(!!visible);
  }, [visible]);

  const handleNavigation = (index) => {
    switch (index) {
      case 0:
        if (history.location.pathname !== "/") history.push("/");
        return onClose();
      case 1:
        if (history.location.pathname !== "/myfavourites")
          history.push("/myfavourites");
        return onClose();
      case 2:
        if (history.location.pathname !== "/myprofile")
          history.push("/myprofile");
        return onClose();
      case 3:
        if (history.location.pathname !== "/about") history.push("/about");
        return onClose();
      case 4:
        return window.open("https://grapesoftware.co.uk/contact/", "_blank");
      case 5:
        return logout();
      default:
        return;
    }
  };

  return (
    <Drawer variant="persistent" anchor="left" open={open}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "0px 8px",
        }}
      >
        <Typography
          variant="h6"
          style={{ flexGrow: 1, margin: "20px 0px 0px 30px" }}
        >
          Food Passport
        </Typography>
        <IconButton onClick={onClose}>
          <ChevronLeft />
        </IconButton>
      </div>
      <Typography
        variant="subtitle1"
        style={{
          width: "75%",
          maxWidth: "200px",
          margin: "8px 0px 0px 38px",
          lineHeight: "1",
        }}
      >
        <sup>Find places that cater for you!</sup>
      </Typography>
      <div role="presentation" style={{ width: "265px", height: "100vh" }}>
        <List>
          {[
            "Search",
            "Favourites",
            "My Profile",
            "Developer",
            "Feedback",
            "Logout",
          ].map((text, index) => (
            <ListItem
              className={index === selected ? "selected" : ""}
              button
              key={text}
              onClick={() => {
                handleNavigation(index);
              }}
              style={{ padding: "8px 16px" }}
            >
              <ListItemIcon
                style={{ justifyContent: "center", color: "inherit" }}
              >
                {index === 0 && <BsSearch />}
                {index === 1 && <BsHeart />}
                {index === 2 && <IoPersonOutline />}
                {index === 3 && <BsInfoCircle />}
                {index === 4 && <VscFeedback />}
                {index === 5 && <RiLogoutCircleLine />}
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </div>
      <div
        style={{
          width: "265px",
        }}
      >
        <a
          className="anchorlogo"
          href="https://grapesoftware.co.uk/"
          target="_blank"
          rel="noopener noreferrer"
          title="Visit Grape Software"
        >
          <Image
            alt="Company Logo"
            draggable={false}
            width="50%"
            src={logo}
            style={{ margin: "20px" }}
          />
        </a>
      </div>
    </Drawer>
  );
}
