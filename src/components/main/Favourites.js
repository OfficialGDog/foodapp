import { useState, useReducer, useEffect, useRef, useCallback } from "react";
import { geodatabase } from "../../firebase/config";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button as MDButton,
} from "@material-ui/core";
import {
  Favorite as FavoriteIcon,
  FavoriteBorderOutlined as NotFavoriteIcon,
} from "@material-ui/icons";
import { Container, Card, Row, ListGroup } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useHistory } from "react-router";
import { AiOutlineMenu } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaMapMarkerAlt } from "react-icons/fa";
import Logout from "./Logout";
import SideDrawer from "./SideDrawer";
import Navbar from "./Navbar";

const ACTIONS = {
  ADD_MARKERS: "add-markers",
  ADD_UPDATE_MARKER: "add-update-marker",
  DELETE_MARKER: "delete-marker",
  RESET_MARKERS: "reset-markers",
};

function reducer(markers, action) {
  switch (action.type) {
    case ACTIONS.ADD_MARKERS:
      return [...markers, ...action.payload];
    case ACTIONS.ADD_UPDATE_MARKER:
      if (!markers.length) return [...markers, action.payload];
      return [
        ...markers.filter(
          (marker) => marker.g_place_id !== action.payload.g_place_id
        ),
        action.payload,
      ];
    case ACTIONS.DELETE_MARKER:
      return markers.filter(
        (marker) => marker.g_place_id !== action.payload.g_place_id
      );
    case ACTIONS.RESET_MARKERS:
      return [];
    default:
      return markers;
  }
}

export default function Favourites() {
  const [markers, dispatch] = useReducer(reducer, []);
  const [contextMenu, setContextMenu] = useState(null);
  const [showLogOutDialog, setShowLogOutDialog] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const listeners = useRef([]);
  const { user, setUserData } = useAuth();
  const history = useHistory();

  const attachListener = (listener) => listeners.current.push(listener);

  const dettachListeners = () =>
    listeners.current.forEach((listener) => listener());

  const getUserFavourites = async () => {
    let favourites = [];
    await setUserData(user);
    if (user.favourites?.length) favourites = user.favourites;
    return favourites;
  };

  const unsetFavourite = useCallback(
    async (marker) => {
      await setUserData(user, {
        uid: user.uid,
        favourites: user.favourites.filter(
          (prev) => prev !== marker.g_place_id
        ),
        isNew: false,
      });

      return dispatch({ type: ACTIONS.DELETE_MARKER, payload: marker });
    },
    [user.favourites]
  );

  const isValidObject = (arr) => {
    return arr.some((obj) => obj.name && obj.vicinity && obj.tags);
  };

  const getCache = () => {
    try {
      let favouritesCache = JSON.parse(localStorage.getItem("favourites"));

      if (favouritesCache.length && isValidObject(favouritesCache)) {
        dispatch({
          type: ACTIONS.ADD_MARKERS,
          payload: favouritesCache,
        });

        return true;
      }
    } catch (error) {
      //console.error(error);
    }

    return false;
  };

  useEffect(() => {
    dispatch({ type: ACTIONS.RESET_MARKERS });
    setTimeout(() => setLoading(false), 500);
    if (getCache()) return;

    //console.log("Fetching Favourites...");

    getUserFavourites()
      .then((data) => {
        // Maximum number of favourites to display (20)
        data.splice(0, 20).forEach((id) => {
          attachListener(
            geodatabase.restaurants.doc(id).onSnapshot(
              (doc) => {
                // Delete the marker if deleted in the database
                if (!doc.exists)
                  return dispatch({
                    type: ACTIONS.DELETE_MARKER,
                    payload: doc.id,
                  });
                // Otherwise add it to the list
                dispatch({
                  type: ACTIONS.ADD_UPDATE_MARKER,
                  payload: doc.data(),
                });
              },
              (error) => console.log(error)
            )
          );
        });
      })
      .catch((error) => console.log(error));

    // Cleanup subscription on unmount
    return () => dettachListeners();
  }, []);

  useEffect(() => {
    try {
      if (!markers.length) return;
      localStorage.setItem("favourites", JSON.stringify(markers));
    } catch (err) {
      //console.log(err);
    }
  }, [markers]);

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
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(true)}
          >
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
              <MenuItem
                onClick={() => {
                  history.push("/myprofile");
                }}
              >
                My profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setContextMenu(null);
                  setShowLogOutDialog(true);
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <SideDrawer
        visible={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        logout={() => {
          setDrawerOpen(false);
          setShowLogOutDialog(true);
        }}
      />
      <Logout
        visible={showLogOutDialog}
        onClose={() => setShowLogOutDialog(false)}
      />
      <Container
        fluid
        style={{ height: "100vh" }}
        onClick={() => setDrawerOpen(false)}
      >
        <br />
        <br />
        <br />
        <br />
        <div style={{ maxWidth: "1200px" }}>
          <Typography
            variant="h5"
            style={{ display: "flex", padding: "0px 20px" }}
          >
            {isLoading
              ? "Loading Favourites..."
              : `Your Favourites (${markers.length}) `}
          </Typography>
          {markers.map((marker, index) => (
            <Card key={index} bg="light">
              <Card.Body>
                <Card.Title as="h3">
                  {marker.name ?? "Name"}
                  <MDButton
                    className="heart"
                    variant="text"
                    aria-label="like"
                    style={{ position: "absolute" }}
                    onClick={() => {
                      unsetFavourite(marker);
                    }}
                  >
                    <FavoriteIcon style={{ color: "#ff6d75" }} />
                  </MDButton>
                </Card.Title>
                <Card.Text>
                  {marker.distance && `${marker.distance} miles away`}{" "}
                  <FaMapMarkerAlt color="#3083ff" />{" "}
                  {marker.vicinity ?? "Address"}
                </Card.Text>
                {!!marker.tags.length && (
                  <>
                    <Typography variant="subtitle1">Suitable for:</Typography>
                    <Container fluid>
                      <Row>
                        <ListGroup horizontal style={{ display: "contents" }}>
                          {marker.tags.map((tag, i) => (
                            <ListGroup.Item
                              key={i}
                              variant="success"
                              className="col-auto venuetag"
                            >
                              {tag}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Row>
                    </Container>
                  </>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
      </Container>
      <Navbar item={1} />
    </>
  );
}
