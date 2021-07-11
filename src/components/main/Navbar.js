import { useEffect, useState } from "react";
import { BsSearch, BsPersonFill } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction } from "@material-ui/core";
import "./Navbar.css";

export default function Navbar(props) {
  const history = useHistory();
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    switch (history.location.pathname) {
      case "/":
        return setIndex(0);
      case "/myfavourites":
        return setIndex(1);
      case "/myprofile":
        return setIndex(2);
      default:
        return;
    }
  }, []);

  useEffect(() => {
    if (props.item != null) return setIndex(props.item);
  }, [props.item]);

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
      default:
        return;
    }
  }, [index]);

  return (
    <>
      <BottomNavigation
        value={index}
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
        {["Search", "My Favourites", "My Profile"].map((text, index) => (
          <BottomNavigationAction
            key={text}
            label={text}
            icon={
              index === 0 ? (
                <BsSearch />
              ) : index === 1 ? (
                <FaHeart />
              ) : (
                index === 2 && <BsPersonFill />
              )
            }
          />
        ))}
      </BottomNavigation>
    </>
  );
}
