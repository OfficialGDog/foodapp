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
import { BiCurrentLocation, BiSearchAlt2 } from "react-icons/bi";
import { BsCardList, BsThreeDotsVertical } from "react-icons/bs";
import DataListInput from "react-datalist-input";
import { useHistory } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Fab,
  Checkbox,
  FormControlLabel,
  withStyles,
} from "@material-ui/core";
import { Button as MDButton } from "@material-ui/core";
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

const CustomCheckbox = withStyles({
  root: {
    color: "#009688",
    "&$checked": {
      color: "#009688",
    },
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);

export default function Home() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    googleMaps: process.env.GOOGLE_MAPS_NEARBY_SEARCH,
    libraries,
  });

  const [markers, dispatch] = useReducer(reducer, []);
  const [location, setLocation] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [filterResults, setFilterResults] = useState(false);
  const [view, setView] = useState({ mapView: true });
  const [userDietaryProfile, setUserDietaryProfile] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const foodContext = useFood();
  const history = useHistory();
  const auth = useAuth();
  const mapRef = useRef();
  const listeners = useRef([]);
  /* 
  const onMapClick = useCallback((event) => {
    dispatch({
      type: ACTIONS.ADD_MARKER,
      payload: {
        coordinates: {
          latitude: event.latLng.lat(),
          longitude: event.latLng.lng(),
        },
        tags: [],
        isNew: true,
      },
    });
  }, []); */

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    // Optional try to get the users current location

    if (!localStorage.getItem("latlng"))
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
        .catch(() => console.log("Unable to locate, geolocation is disabled!"));
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

  const getCache = () => {
    try {
      let markerCache = JSON.parse(localStorage.getItem("markers"));

      const lastupdated = localStorage.getItem("updated");

      if (!markerCache) markerCache = [];

      if (!isDateLessThanOneHourAgo(new Date(lastupdated))) {
        localStorage.clear();
        return false;
      }

      if (typeof markerCache === "object")
        dispatch({ type: ACTIONS.ADD_MARKERS, payload: markerCache });

      return markerCache.length ? true : false;
    } catch (error) {
      console.error(error);
    }
  };

  const updateLastUpdated = () => {
    try {
      localStorage.setItem("updated", new Date());
    } catch (error) {
      console.error(error);
    }
  };

  // Returns an array of map markers for the users current location
  useEffect(() => {
    if (!location) return;
    if (!location.lat && !location.lng) return;
    center = { ...location, zoom: 14 };

    // Reset markers when the user changes location
    dispatch({ type: ACTIONS.RESET_MARKERS });
    try {
      const prevLoc = localStorage.getItem("latlng");

      if (prevLoc === JSON.stringify(location)) {
        if (getCache()) return console.log(`Serving markers from cache`);
      }

      localStorage.setItem("latlng", JSON.stringify({ ...location }));
    } catch (error) {
      console.error(error);
    }

    console.log("Fetching Map Markers ...", location);

    const obj = {
      lat: location.lat,
      lng: location.lng,
      radius: location.radius,
    };

    // On inital load get Firestore Map Markers near the users location
    fetchDatabaseMarkers(obj)
      .get()
      .then((querySnapshot) => {
        let data = [];

        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          data.push({
            ...doc.data(),
            distance: parseFloat(doc.distance / 1.6).toFixed(1),
            id: doc.id,
          });
        });

        dispatch({ type: ACTIONS.ADD_MARKERS, payload: data });

        console.log(`Fetching Google Markers`);
        // Get the rest of the map marker data from Google
        fetchGoogleMarkers(obj)
          .then((response) => {
            // Filter Google Map Markers not in the database
            const newMarkers = response.filter(
              (location) =>
                !data.some((item) => item.g_place_id === location.place_id)
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
          })
          .catch((error) => console.error(error));

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

              if (change.type === "added")
                return dispatch({
                  type:
                    !data.some((item) => item.id === changedata.id) &&
                    ACTIONS.ADD_MARKER,
                  payload: { ...changedata },
                }); //CHECK IF ALREADY EXISTS
            });
          },
          (error) => console.log(error)
        );

        attachListener(unsubscribe);
      })
      .catch((error) => console.error(error));

    // Cleanup subscription on unmount
    return () => dettachListeners();
  }, [location]);

  useEffect(() => {
    if (!selected) return;
    setSelected(markers.find((item) => item.id === selected.id));
  }, [selected, markers]);

  useEffect(() => {
    try {
      if (!markers.length) return;
      localStorage.setItem("markers", JSON.stringify(markers));
    } catch (error) {
      console.error(error);
    }
  }, [markers]);

  useEffect(() => {
    setUserDietaryProfile([
      ...foodContext.selected.filter(
        (item) => item.path.split("/")[0] === "dietaryconditions"
      ),
    ]);
  }, [foodContext.selected]);

  useEffect(() => {
    if (!selected) return;
    if (!userDietaryProfile) return;
    if (!filterResults) return;

    const keepSelected = userDietaryProfile.some((condition) =>
      selected.tags.some((tag) => condition.name === tag)
    );
    if (!keepSelected) setSelected(null);
  }, [filterResults, selected, userDietaryProfile]);

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
    setLocation({ lat, lng, radius: 1000 });
  }, []);

  useEffect(() => {
    try {
      // Hides Welcome Message
      const hideModal = localStorage.getItem("hideWelcome");
      if (!hideModal) setModal(true);
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
    setSelected(null);
  }, [view]);

  const interact = useLongPress({
    onClick: () => setSelected(null),
  });

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";
  if (!userDietaryProfile) return "Loading...";

  const filterDC = (marker) => {
    if (!filterResults) return true;
    if (marker.isNew) return true; // Shows markers created by the user
    return userDietaryProfile.some((condition) =>
      marker.tags.some((tag) => condition.name === tag)
    );
  };

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
        <Toolbar style={{ height: "125px", alignItems: "flex-start" }}>
          <IconButton edge="start" color="inherit" aria-label="open drawer">
            <AiOutlineMenu />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            style={{ position: "absolute", top: "8px", paddingLeft: "2.5rem" }}
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
                .catch(() =>
                  console.log("Unable to locate, geolocation is disabled!")
                );
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
              <MenuItem
                onClick={() => auth.logout().then(() => history.push("/login"))}
              >
                Sign Out
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <Container fluid style={{ marginTop: "125px" }}>
        <Container className="text-center">
          <FormControlLabel
            label="Filter Markers"
            style={{ position: "relative", left: "6vh" }}
            control={
              <CustomCheckbox
                checked={filterResults}
                onClick={() => setFilterResults(!filterResults)}
              />
            }
          />
          <Row>{filterResults && <foodContext.FilterDietaryConditions />}</Row>
        </Container>

        {view.mapView ? (
          <>
            <Modal open={modal} title="Disclaimer" onClose={hideModal}>
              This app is currently in beta testing, we're currently adding more
              information.
            </Modal>
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
                    <h5>{selected.name ?? "Name"}</h5>
                    <p>{selected.vicinity ?? "Address"}</p>
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
                          </ListGroup>
                        </Row>
                      </Container>
                    )}
                    {/*                     <button
                      className="mt-2"
                      onClick={() => {
                        updateMarker({
                          lat: selected.geometry.location.lat(),
                          lng: selected.geometry.location.lng(),
                        });
                      }}
                    >
                      Save
                    </button> */}
                  </div>
                </InfoWindow>
              ) : null}
            </GoogleMap>
            <Fab
              size="large"
              color="secondary"
              aria-label="cardview"
              style={{
                fontSize: "2rem",
                backgroundColor: "white",
                color: "black",
                position: "fixed",
                bottom: "45px",
                margin: "25px 10px",
                width: "65px",
                height: "65px",
              }}
              onClick={toggleView}
            >
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
            >
              Select below
            </Modal>
            <Typography variant="h5" style={{ margin: "20px 0px 0px 20px" }}>
              Found{" "}
              {filterResults
                ? markers.filter((marker) => filterDC(marker)).length
                : markers.length}{" "}
              Matches
            </Typography>
            {markers.map(
              (marker, index) =>
                filterDC(marker) && (
                  <Card key={index} bg="light">
                    <Card.Body>
                      <Card.Title as="h3">{marker.name ?? "Name"}</Card.Title>
                      <Card.Text>
                        {marker.distance && `${marker.distance} miles away`}{" "}
                        <br />
                        <FaMapMarkerAlt color="#3083ff" />{" "}
                        {marker.vicinity ?? "Address"}
                      </Card.Text>
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
                        </Container>
                      )}
                    </Card.Body>
                  </Card>
                )
            )}
            <Fab
              size="large"
              color="secondary"
              aria-label="mapview"
              style={{
                fontSize: "2rem",
                backgroundColor: "white",
                color: "black",
                position: "fixed",
                bottom: "45px",
                margin: "25px 10px",
                width: "65px",
                height: "65px",
              }}
              onClick={toggleView}
            >
              <IoIosGlobe />
            </Fab>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
          </>
        )}
      </Container>
      <Navbar item={0} />
    </>
  );
}

function Locate({ panTo }) {
  return <button>Locate</button>;
}

function Search({ panTo }) {
  const {
    ready,
    value,
    suggestions: { status, data },
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
        placeholder="🔎 Search"
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
            const { lat, lng } = await getLatLng(results[0]);
            panTo({ lat, lng });
          } catch (error) {
            console.error(error);
          }
        }}
      />
    </div>
  );
}
