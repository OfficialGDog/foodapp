import { useEffect, useState } from "react";
import { Navbar as FNavBar, Nav } from "react-bootstrap";
import { BsSearch, BsPersonFill } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import "./Navbar.css";

export default function Navbar(props) {
  const history = useHistory();
  const [index, setIndex] = useState(null);

  useEffect(() => {
    switch (index) {
      case 0:
        if (history.location.pathname !== "/") history.push("/");
        return;
      case 1:
        if (history.location.pathname !== "/myfavourites")
          history.push("/myfavourites");
        return;
      case 2:
        if (history.location.pathname !== "/myprofile")
          history.push("/myprofile");
        return;
    }
  }, [index]);

  return (
    <>
      <BottomNavigation
        value={index || props.item}
        onChange={(event, newValue) => {
          setIndex(newValue);
        }}
        showLabels
        style={{
          position: "fixed",
          bottom: "0",
          width: "100%",
        }}
      >
        <BottomNavigationAction label="Search" icon={<BsSearch />} />
        <BottomNavigationAction label="Favorites" icon={<FaHeart />} />
        <BottomNavigationAction label="Profile" icon={<BsPersonFill />} />
      </BottomNavigation>
    </>
  );
}
