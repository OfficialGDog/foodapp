import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useReducer,
} from "react";
import { geodatabase, geoPoint } from "../../firebase/config";
import useLongPress from "../../useLongPress";
import { useFood } from "../../context/FoodContext";
import { useAuth } from "../../context/AuthContext";
import Navbar from "./Navbar";
import Modal from "./Modal";
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoIosGlobe } from "react-icons/io";
import { AiOutlineMenu } from "react-icons/ai";
import { BiCurrentLocation } from "react-icons/bi";
import { BsCardList, BsThreeDotsVertical, BsSearch } from "react-icons/bs";
import { RiBarChartHorizontalLine } from "react-icons/ri";
import DataListInput from "react-datalist-input";
import SideDrawer from "./SideDrawer";
import { useHistory } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Link,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  ButtonGroup,
  Paper,
  CircularProgress,
} from "@material-ui/core";
import { Button as MDButton } from "@material-ui/core";
import Slider from "react-rangeslider";
import Logout from "./Logout";
import {
  Favorite as FavoriteIcon,
  FavoriteBorderOutlined as NotFavoriteIcon,
  Close as CloseButton,
  Delete as DeleteIcon,
  ArrowDropDown,
} from "@material-ui/icons";
import "react-rangeslider/lib/index.css";
import "./Home.css";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import { Container, Card, ListGroup, Row } from "react-bootstrap";

import mapStyles from "../../mapStyles";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

const libraries = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

let center = {
  lat: 0,
  lng: 0,
  radius: 1000,
  zoom: 2,
};

const options = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
};

const ACTIONS = {
  ADD_MARKERS: "add-markers",
  ADD_MARKER: "add-marker",
  UPDATE_MARKER: "update-marker",
  DELETE_MARKER: "delete-marker",
};

function reducer(markers, action) {
  switch (action.type) {
    case ACTIONS.ADD_MARKERS:
      return [
        ...markers,
        ...action.payload.map((marker) => {
          return {
            ...marker,
            geometry: {
              location: {
                lat: () => marker.coordinates.latitude,
                lng: () => marker.coordinates.longitude,
              },
            },
          };
        }),
      ];
    case ACTIONS.ADD_MARKER:
      return [
        ...markers,
        {
          geometry: {
            location: {
              lat: () => action.payload.coordinates.latitude,
              lng: () => action.payload.coordinates.longitude,
            },
          },
          ...action.payload,
        },
      ];
    case ACTIONS.UPDATE_MARKER:
      return markers.map((marker) =>
        marker.id === action.payload.id
          ? { ...marker, ...action.payload }
          : marker
      );
    case ACTIONS.DELETE_MARKER:
      return markers.filter((marker) => marker.id !== action.payload.id);
    case ACTIONS.RESET_MARKERS:
      return [];
    default:
      return markers;
  }
}

export default function Home() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    googleMaps: process.env.GOOGLE_MAPS_NEARBY_SEARCH,
    libraries,
  });

  const [markers, dispatch] = useReducer(reducer, []);
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(1000);
  const [selected, setSelected] = useState(null);
  const [autoSelect, setAutoSelect] = useState(null);
  const [modal, setModal] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showLogOutDialog, setShowLogOutDialog] = useState(false);
  const [showLocationUnavailableDialog, setLocationUnavailableDialog] =
    useState(false);
  const [showTip, setShowTip] = useState(true);
  const [view, setView] = useState({ mapView: true });
  const [userDietaryProfile, setUserDietaryProfile] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const foodContext = useFood();
  const history = useHistory();
  const { user, setUserData } = useAuth();
  const mapRef = useRef();
  const listeners = useRef([]);

  const isValidLatLng = (obj) => {
    return !!(
      /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/.test(obj.lat) &&
      /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/.test(obj.lng)
    );
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;

    try {
      let prevLocation = JSON.parse(localStorage.getItem("latlng"));
      if (
        "lat" in prevLocation &&
        "lng" in prevLocation &&
        isValidLatLng(prevLocation)
      )
        return setLocation({
          lat: prevLocation.lat,
          lng: prevLocation.lng,
          radius: 1000,
        });
    } catch (error) {
      //console.error(error);
    }

    getUserLocation()
      .then((res) => {
        if (res) {
          setLocation({
            lat: res.coords.latitude,
            lng: res.coords.longitude,
            radius: 1000,
          });
        } else {
          setLocation(center);
        }
      })
      .catch(() =>
        console.log(
          "Request for the user location has been blocked by the browser"
        )
      );
  }, []);

  const fetchGoogleMarkers = ({ lat, lng, radius }) => {
    let service = new window.google.maps.places.PlacesService(mapRef.current);
    return new Promise((resolve, reject) => {
      service.nearbySearch(
        { type: "restaurant", location: { lat, lng }, radius },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject([]);
          }
        }
      );
    });
  };

  const fetchMarkerbyID = (id) => {
    return geodatabase.restaurants.doc(id);
  };

  const fetchDatabaseMarkers = ({ lat, lng, radius }) => {
    return geodatabase.restaurants
      .near({ center: geoPoint(lat, lng), radius: (radius / 1000) * 1.6 })
      .limit(25);
  };

  const getUserLocation = () => {
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej);
    });
  };

  const attachListener = (listener) => listeners.current.push(listener);

  const dettachListeners = () =>
    listeners.current.forEach((listener) => listener());

  const isDateLessThanOneHourAgo = (date) => {
    const HOUR = 1000 * 60 * 60;
    const oneHourAgo = Date.now() - HOUR * 1;
    return date > oneHourAgo;
  };

  const isValidMarkers = (arr) => {
    return arr.some((obj) => obj.name && obj.vicinity && !!obj.tags);
  };

  const getCache = () => {
    try {
      const { lat, lng, radius } = JSON.parse(localStorage.getItem("latlng"));

      if (JSON.stringify({ lat, lng, radius }) === JSON.stringify(location)) {
        let markerCache = JSON.parse(localStorage.getItem("markers"));

        const lastupdated = localStorage.getItem("updated");

        if (!isDateLessThanOneHourAgo(new Date(lastupdated))) {
          localStorage.clear();
          return false;
        }

        setShowProgress(false);

        if (markers.length) return true;

        if (markerCache.length && isValidMarkers(markerCache)) {
          dispatch({ type: ACTIONS.ADD_MARKERS, payload: markerCache });
          return true;
        }
      }
    } catch (error) {
      //console.error(error);
    }

    return false;
  };

  const updateLastUpdated = () => {
    try {
      localStorage.setItem("updated", new Date());
    } catch (error) {
      console.error(error);
    }
  };

  const updateDietaryProfile = () => {
    setUserDietaryProfile([
      ...foodContext.selected.filter(
        (item) => item.path.split("/")[0] === "dietaryconditions"
      ),
    ]);
  };

  // Returns an array of map markers for the users current location
  useEffect(async () => {
    try {
      if (!location) return;
      if (!location.lat && !location.lng) return;

      let data = [],
        newMarkers = [];

      center = { ...location, zoom: 14 };

      if (getCache()) return;

      dispatch({ type: ACTIONS.RESET_MARKERS });

      //console.log("Fetching Map Markers ...", location);

      const obj = {
        lat: location.lat,
        lng: location.lng,
        radius: location.radius,
      };

      // Logic for when a user selects a food establishment which doesn't exist in the database
      if (location.place && location.place.length) {
        const { exists } = await fetchMarkerbyID(
          location.place[0].g_place_id
        ).get();

        if (!exists) {
          newMarkers.push({
            ...location.place[0],
            place_id: location.place[0].g_place_id,
            geometry: {
              location: {
                lat: () => location.place[0].lat,
                lng: () => location.place[0].lng,
              },
            },
          });
        }
      }

      // Get Map Markers near the users location
      const { docs } = await fetchDatabaseMarkers(obj).get();

      docs.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        data.push({
          ...doc.data(),
          distance: parseFloat(doc.distance / 1.6).toFixed(1),
          id: doc.id,
        });
      });

      // If the user selected a particular restauraunt display it at top of list
      if (location.place && location.place.length) {
        const found = data.filter(
          (marker) => marker.g_place_id === location.place[0].g_place_id
        );
        if (found.length) {
          setAutoSelect(location.place[0]);
          data = [
            ...found,
            ...data.filter(
              (marker) => marker.g_place_id !== location.place[0].g_place_id
            ),
          ];
        }
      }

      dispatch({ type: ACTIONS.ADD_MARKERS, payload: data });

      //console.log(`Fetching Google Markers`);
      // Get the rest of the map marker data from Google
      const GoogleMarkers = await fetchGoogleMarkers(obj);

      // Filter Google Map Markers not in the database
      newMarkers.push(
        ...GoogleMarkers.filter(
          (location) =>
            !data.some((item) => item.g_place_id === location.place_id)
        )
      );

      // Are there any new map markers? If so add them to the database.
      if (newMarkers.length)
        newMarkers.forEach((marker) => {
          //console.warn(`Adding Google Marker with id: ${marker.place_id} to the database`);
          geodatabase.restaurants.doc(marker.place_id).set({
            coordinates: geoPoint(
              marker.geometry.location.lat(),
              marker.geometry.location.lng()
            ),
            g_place_id: marker.place_id,
            name: marker.name,
            tags: [],
            vicinity: marker.vicinity,
          });
        });

      const unsubscribe = fetchDatabaseMarkers(obj).onSnapshot(
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            updateLastUpdated();

            if (change.type === "removed")
              return dispatch({
                type: ACTIONS.DELETE_MARKER,
                payload: { id: change.doc.id },
              });

            const changedata = {
              ...change.doc.data(),
              distance: parseFloat(change.doc.distance / 1.6).toFixed(1),
              id: change.doc.id,
            };

            if (change.type === "modified")
              return dispatch({
                type: ACTIONS.UPDATE_MARKER,
                payload: { ...changedata },
              });

            if (change.type === "added") {
              if (
                location.place &&
                location.place.length &&
                changedata.g_place_id === location.place[0].g_place_id
              )
                setSelected({
                  ...changedata,
                  geometry: {
                    location: {
                      lat: () => changedata.coordinates.latitude,
                      lng: () => changedata.coordinates.longitude,
                    },
                  },
                });

              return dispatch({
                type:
                  !data.some((item) => item.id === changedata.id) &&
                  ACTIONS.ADD_MARKER,
                payload: { ...changedata },
              });
            }
          });
        },
        (error) => console.log(error)
      );

      attachListener(unsubscribe);

      localStorage.setItem("latlng", JSON.stringify({ ...location }));
    } catch (error) {
      console.log(error);
    }

    setShowProgress(false);

    // Cleanup subscription on unmount
    return () => dettachListeners();
  }, [location]);

  /*   useEffect(() => {
    document.body.style.overflow = showProgress ? "hidden" : "auto";
  }, [showProgress]); */

  useEffect(() => {
    if (!markers.length) return;
    if (!autoSelect) return;

    setSelected(
      markers.find((marker) => marker.g_place_id === autoSelect.g_place_id)
    );

    setAutoSelect(null);
  }, [markers, autoSelect]);

  useEffect(() => {
    try {
      if (!markers.length) return;
      localStorage.setItem("markers", JSON.stringify(markers));
      let favouriteCache = JSON.parse(localStorage.getItem("favourites"));
      if (!favouriteCache || typeof favouriteCache !== "object")
        favouriteCache = [];
      localStorage.setItem(
        "favourites",
        JSON.stringify(
          favouriteCache.map(
            (obj) =>
              markers.find((obj2) => obj2.g_place_id === obj.g_place_id) ?? obj
          )
        )
      );
    } catch (error) {
      console.error(error);
    }
  }, [markers]);

  useEffect(() => {
    updateDietaryProfile();
    setShowTip(true);
  }, [foodContext.selected]);

  const panTo = useCallback(({ lat, lng, place }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
    setShowProgress(true);
    // Optional 4th parameter for showing a particular food establishment
    setLocation({ lat, lng, radius: 1000, place });
  }, []);

  useEffect(() => {
    try {
      // Hides Welcome Message
      const hideModal = localStorage.getItem("hideWelcome");
      if (hideModal === "true") return setModal(false);
      setModal(true);
    } catch (error) {
      console.error(error);
    }
  }, []);

  /*   // Call when a user creates a new map marker
  const updateMarker = useCallback(({ lat, lng }) => {
    // Create a reference to the geolocation so it can be added to firestore
    const coordinates = geoPoint(lat, lng);
    // Add a GeoDocument to a GeoCollection
    geodatabase.restaurants.add({
      name: "name",
      vicinity: "address",
      tags: ["", "", ""],
      coordinates,
    });
  }, []); */

  const setFavourite = useCallback(
    async (marker, value) => {
      try {
        const favouritesCache = JSON.parse(localStorage.getItem("favourites"));
        if (!favouritesCache || !favouritesCache.length) favouritesCache = [];
        switch (value) {
          case true:
            localStorage.setItem(
              "favourites",
              JSON.stringify([...favouritesCache, marker])
            );
            break;
          default:
            localStorage.setItem(
              "favourites",
              JSON.stringify(
                favouritesCache.filter(
                  (prev) => prev.g_place_id !== marker.g_place_id
                )
              )
            );
            break;
        }
      } catch (error) {
        //console.log(error);
      }
      if (!user.favourites) user.favourites = [];
      await setUserData(user, {
        uid: user.uid,
        favourites: value
          ? [...user.favourites, marker.g_place_id]
          : user.favourites.filter((prev) => prev !== marker.g_place_id),
        isNew: false,
      });
    },
    [user]
  );

  const handleCancel = () => {
    setShowFilterOptions(false);
  };

  const hideModal = useCallback(() => {
    try {
      setModal(false);
      localStorage.setItem("hideWelcome", true);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const toggleView = useCallback(() => {
    if (!view) return;
    setView((prevState) => ({ mapView: !prevState.mapView }));
  }, [view]);

  const interact = useLongPress({
    onClick: () => setSelected(null),
  });

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";
  if (!userDietaryProfile) return "Loading...";

  const filterDC = (marker) => {
    if (marker.isNew) return true; // Shows markers created by the user
    if (!userDietaryProfile.length) return true;
    return userDietaryProfile.some((condition) =>
      marker.tags.some((tag) =>
        tag.toLowerCase().includes(condition.name.toLowerCase())
      )
    );
  };

  const filteredMarkers = markers.filter((marker) => filterDC(marker));

  const isFavourite = (marker) =>
    user.favourites && user.favourites.includes(marker.g_place_id);

  return (
    <>
      <div className={`overlay ${!showProgress ? "d-none" : ""}`}>
        <CircularProgress className="progress" />
      </div>
      <AppBar
        id="navbar"
        position="fixed"
        onClick={() => isDrawerOpen && setDrawerOpen(false)}
      >
        <Toolbar style={{ height: "125px", alignItems: "flex-start" }}>
          <IconButton
            style={{ zIndex: 1 }}
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <AiOutlineMenu />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            style={{
              position: "absolute",
              top: "8px",
              paddingLeft: "2.5rem",
            }}
          >
            {view.mapView ? "Map View 🗺" : "Card View 🗃"}
          </Typography>
          <div style={{ alignSelf: "flex-end", width: "100%" }}>
            <Search panTo={panTo} />
          </div>

          <IconButton
            aria-label="User account"
            edge="end"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            color="inherit"
            onClick={() => {
              getUserLocation()
                .then((res) => {
                  if (res) {
                    panTo({
                      lat: res.coords.latitude,
                      lng: res.coords.longitude,
                    });
                  }
                })
                .catch(() => setLocationUnavailableDialog(true));
            }}
          >
            <BiCurrentLocation />
          </IconButton>
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
              <MenuItem onClick={toggleView}>
                {view.mapView ? "View List" : "View Map"}
              </MenuItem>
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
        <div
          style={{
            position: "relative",
            top: "-5px",
            marginBottom: "5px",
            marginLeft: "20px",
          }}
        >
          <MDButton
            variant="outlined"
            size="large"
            onClick={() => setShowFilterOptions(true)}
          >
            Filter <ArrowDropDown />
          </MDButton>
        </div>
      </AppBar>

      <SideDrawer
        visible={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        logout={() => {
          setDrawerOpen(false);
          setShowLogOutDialog(true);
        }}
      />

      <Dialog
        id="filter-dialog"
        onClose={handleCancel}
        aria-labelledby="filter-marker"
        open={showFilterOptions}
      >
        <DialogTitle id="fitler-dialog-title">Filter Options</DialogTitle>
        <DialogContent style={{ paddingBottom: "0px", minWidth: "160px" }}>
          <Typography variant="subtitle1">
            Tell us about your dietary conditions to filter your search results.
          </Typography>
          <Container style={{ padding: "16px 5px" }}>
            <foodContext.FilterDietaryConditions />
            {/*  <Typography variant="h5">Within:</Typography>
            <Slider
              min={1}
              max={20}
              step={1}
              value={radius / 1000}
              tooltip={false}
              format={(val) => val + " miles"}
              onChange={(val) => {
                setRadius(val * 1000);
              }}
            />
            <Typography variant="h5">
              {radius / 1000} {radius / 1000 === 1 ? "Mile" : "Miles"}
            </Typography> */}
          </Container>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button
            autoFocus
            onClick={() => {
              updateDietaryProfile();
              handleCancel();
            }}
            color="primary"
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      <Logout
        visible={showLogOutDialog}
        onClose={() => setShowLogOutDialog(false)}
      />

      <Dialog
        onClose={() => setLocationUnavailableDialog(false)}
        aria-labelledby="location-dialog"
        open={showLocationUnavailableDialog}
      >
        <DialogTitle>Location unavailable</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sorry, but we are unable to find your location, please turn on /
            allow location access in your browser.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {" "}
          <Button
            onClick={() => setLocationUnavailableDialog(false)}
            color="primary"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>

      <Container
        fluid
        style={{ marginTop: "170px", padding: "0" }}
        onClick={() => setDrawerOpen(false)}
      >
        {view.mapView ? (
          <>
            <Modal
              marker={selected}
              dietaryconditions={foodContext.dietaryConditions}
              open={modal}
              title={selected ? "Add Dietary Tags" : "Disclaimer"}
              onClose={
                selected
                  ? (e) => {
                      !setModal(false) &&
                        e.target.tagName === "SPAN" &&
                        setSelected({
                          ...selected,
                          tags: [
                            ...e.target
                              .closest("div.MuiPaper-root")
                              .querySelectorAll(".Mui-checked"),
                          ]
                            .map((item) => item.parentElement)
                            .map((tag) => tag.innerText),
                        }) &&
                        dispatch({
                          type: ACTIONS.UPDATE_MARKER,
                          payload: {
                            ...selected,
                            tags: [
                              ...e.target
                                .closest("div.MuiPaper-root")
                                .querySelectorAll(".Mui-checked"),
                            ]
                              .map((item) => item.parentElement)
                              .map((tag) => tag.innerText),
                          },
                        });
                    }
                  : hideModal
              }
              onCancel={() => setModal(false)}
            >
              This app is currently in beta testing, we're currently adding more
              information.
            </Modal>
            {showTip && filteredMarkers.length < markers.length && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: ".75rem",
                  position: "fixed",
                  zIndex: "98",
                  left: 0,
                  right: 0,
                }}
              >
                <Paper
                  style={{
                    width: "75%",
                    maxWidth: "fit-content",
                    fontSize: "1rem",
                  }}
                >
                  <IconButton
                    style={{ float: "right", padding: "10px" }}
                    onClick={() => setShowTip(false)}
                  >
                    <CloseButton />
                  </IconButton>
                  <Typography
                    variant="h6"
                    style={{
                      padding: "12px 15px",
                      fontSize: "1rem",
                      width: "90%",
                    }}
                  >
                    Can't find what your looking for?{" "}
                    <Link
                      style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                      underline="always"
                      onClick={() => setUserDietaryProfile([])}
                    >
                      Turn off filtering
                    </Link>
                  </Typography>
                </Paper>
              </div>
            )}
            <GoogleMap
              {...interact}
              mapContainerStyle={mapContainerStyle}
              zoom={center.zoom}
              center={center}
              options={options}
              onLoad={onMapLoad}
            >
              {markers.map(
                (marker, index) =>
                  filterDC(marker) && (
                    <Marker
                      key={index}
                      animation={window.google.maps.Animation.Wp}
                      position={{
                        lat: marker.geometry.location.lat(),
                        lng: marker.geometry.location.lng(),
                      }}
                      icon={{
                        url: "/marker.svg",
                        scaledSize: new window.google.maps.Size(30, 30),
                        origin: new window.google.maps.Point(0, 0),
                        anchor: new window.google.maps.Point(15, 15),
                      }}
                      onClick={() => {
                        setSelected(marker);
                      }}
                    />
                  )
              )}

              {selected ? (
                <InfoWindow
                  position={{
                    lat: selected.geometry.location.lat(),
                    lng: selected.geometry.location.lng(),
                  }}
                  onCloseClick={() => {
                    setSelected(null);
                  }}
                >
                  <div>
                    <div
                      style={{ display: "inline-flex", alignItems: "center" }}
                    >
                      <h5>{selected.name ?? "Name"}</h5>
                      <MDButton
                        className="heart"
                        variant="text"
                        aria-label="like"
                        style={{ top: "-4px" }}
                        onClick={() => {
                          setFavourite(selected, !isFavourite(selected));
                        }}
                      >
                        {isFavourite(selected) ? (
                          <FavoriteIcon style={{ color: "#ff6d75" }} />
                        ) : (
                          <NotFavoriteIcon style={{ color: "#ff6d75" }} />
                        )}
                      </MDButton>
                    </div>
                    <p>{selected.vicinity ?? "Address"}</p>
                    <Typography variant="subtitle2">
                      You can add/remove dietary tags for this venue.
                    </Typography>
                    <Typography variant="subtitle1">Suitable for:</Typography>
                    {selected.tags && (
                      <Container fluid>
                        <Row>
                          <ListGroup horizontal style={{ display: "contents" }}>
                            {selected.tags.map((tag, i) => (
                              <ListGroup.Item
                                key={i}
                                variant="success"
                                className="col-auto venuetag"
                              >
                                {tag}
                              </ListGroup.Item>
                            ))}
                            <MDButton
                              variant="outlined"
                              onClick={() => {
                                setModal(true);
                              }}
                            >
                              Add Tag
                            </MDButton>
                          </ListGroup>
                        </Row>
                      </Container>
                    )}
                  </div>
                </InfoWindow>
              ) : null}
            </GoogleMap>
            <Fab
              id="cardbutton"
              size="large"
              color="secondary"
              aria-label="cardview"
              onClick={toggleView}
            >
              <Typography variant="caption">View List</Typography>
              <BsCardList />
            </Fab>
            <br />
            <br />
          </>
        ) : (
          <>
            <Modal
              marker={selected}
              dietaryconditions={foodContext.dietaryConditions}
              open={modal}
              title="Add Dietary Tags"
              onClose={(e) => {
                !setModal(false) &&
                  e.target.tagName === "SPAN" &&
                  dispatch({
                    type: ACTIONS.UPDATE_MARKER,
                    payload: {
                      ...selected,
                      tags: [
                        ...e.target
                          .closest("div.MuiPaper-root")
                          .querySelectorAll(".Mui-checked"),
                      ]
                        .map((item) => item.parentElement)
                        .map((tag) => tag.innerText),
                    },
                  });
              }}
              onCancel={() => setModal(false)}
            >
              Select below
            </Modal>
            <hr />
            <div style={{ maxWidth: "1200px" }}>
              <Typography
                variant="h5"
                style={{ display: "flex", padding: "0px 20px" }}
              >
                Found {filteredMarkers.length} Match
                {filteredMarkers.length === 1 ? "" : "es"}
              </Typography>
              {showTip && filteredMarkers.length < markers.length && (
                <Paper
                  style={{
                    display: "inline-flex",
                    margin: ".75rem",
                  }}
                >
                  <Typography variant="h6" style={{ padding: "12px 15px" }}>
                    Can't find what your looking for?{" "}
                    <Link
                      style={{ cursor: "pointer" }}
                      underline="always"
                      onClick={() => setUserDietaryProfile([])}
                    >
                      Turn off filtering
                    </Link>
                  </Typography>
                  <IconButton
                    style={{ float: "right", padding: "10px" }}
                    onClick={() => setShowTip(false)}
                  >
                    <CloseButton />
                  </IconButton>
                </Paper>
              )}
              {markers
                .sort((a, b) => a.distance - b.distance)
                .map(
                  (marker, index) =>
                    filterDC(marker) && (
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
                                setFavourite(marker, !isFavourite(marker));
                              }}
                            >
                              {isFavourite(marker) ? (
                                <FavoriteIcon style={{ color: "#ff6d75" }} />
                              ) : (
                                <NotFavoriteIcon style={{ color: "#ff6d75" }} />
                              )}
                            </MDButton>
                          </Card.Title>
                          <Card.Text>
                            {marker.distance && `${marker.distance} miles away`}{" "}
                            <br />
                            <FaMapMarkerAlt color="#3083ff" />{" "}
                            {marker.vicinity ?? "Address"}
                            <Typography variant="subtitle2">
                              You can add/remove dietary tags for this venue.
                            </Typography>
                          </Card.Text>
                          <Typography variant="subtitle1">
                            Suitable for:
                          </Typography>
                          {marker.tags && (
                            <Container fluid>
                              <Row>
                                <ListGroup
                                  horizontal
                                  style={{ display: "contents" }}
                                >
                                  {marker.tags.map((tag, i) => (
                                    <ListGroup.Item
                                      key={i}
                                      variant="success"
                                      className="col-auto venuetag"
                                    >
                                      {tag}
                                    </ListGroup.Item>
                                  ))}

                                  <MDButton
                                    variant="outlined"
                                    onClick={() => {
                                      setSelected(marker);
                                      setModal(true);
                                    }}
                                  >
                                    Add Tag
                                  </MDButton>
                                </ListGroup>
                              </Row>
                              <Row>
                                <MDButton
                                  size="medium"
                                  variant="outlined"
                                  style={{
                                    padding: ".75rem 1.25rem",
                                    marginTop: "10px",
                                  }}
                                  onClick={() => {
                                    setSelected(marker);
                                    setView({ mapView: true });
                                  }}
                                >
                                  Show on map
                                </MDButton>
                                {/*    <MDButton
                                  startIcon={<DeleteIcon />}
                                  color="secondary"
                                  size="medium"
                                  variant="contained"
                                  style={{
                                    padding: "0.75rem 1.25rem",
                                    marginTop: "10px",
                                  }}
                                  onClick={() => {
                                    dispatch({
                                      type: ACTIONS.DELETE_MARKER,
                                      payload: marker,
                                    });
                                    return geodatabase.restaurants
                                      .doc(marker.g_place_id)
                                      .delete();
                                  }}
                                >
                                  Delete
                                </MDButton> */}
                              </Row>
                            </Container>
                          )}
                        </Card.Body>
                      </Card>
                    )
                )}
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
            <Fab
              id="mapbutton"
              size="large"
              color="secondary"
              aria-label="mapview"
              onClick={toggleView}
            >
              <Typography variant="caption">View Map</Typography>
              <IoIosGlobe />
            </Fab>
          </>
        )}
        <Fab
          id="filterbutton"
          variant="extended"
          color="primary"
          aria-label="add"
          onClick={() => setShowFilterOptions(true)}
        >
          <RiBarChartHorizontalLine
            strokeWidth="1"
            style={{ color: "black" }}
          />
          Filter
        </Fab>
      </Container>
      <Navbar item={0} />
    </>
  );
}

function Search({ panTo }) {
  const {
    ready,
    value,
    suggestions: { data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: {
        lat: () => 55.0103,
        lng: () => -1.44464,
      },
      radius: 200 * 1000,
    },
    debounce: 300,
  });

  return (
    <div>
      <DataListInput
        placeholder="Search a location or food business"
        items={data.map(({ place_id, description }) => ({
          key: place_id,
          label: description,
        }))}
        value={value}
        disabled={!ready}
        onInput={(val) => setValue(val)}
        onSelect={async ({ label }) => {
          setValue(label, false);
          clearSuggestions();
          try {
            const results = await getGeocode({ address: label });
            const { types } = results[0];
            const { lat, lng } = await getLatLng(results[0]);
            const place = [];
            // Below checks if the selected result is a food establishment (place)
            if (
              types.filter((v) =>
                [
                  "bar",
                  "restaurant",
                  "meal_takeaway",
                  "meal_delivery",
                ].includes(v)
              ).length
            )
              place[0] = {
                name: label.split(",")[0] || "name",
                vicinity: results[0].formatted_address || "address",
                g_place_id: results[0].place_id,
                lat,
                lng,
              };

            panTo({ lat, lng, place });
          } catch (error) {
            console.error(error);
          }
        }}
      />
      <BsSearch className="search-icon" />
    </div>
  );
}
