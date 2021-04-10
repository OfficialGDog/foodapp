import React, { useState, useRef, useEffect, useCallback, useReducer } from "react";
import { geodatabase, geoPoint } from "../../firebase/config"
import useLongPress from "../../useLongPress";
import { useFood } from "../../context/FoodContext";
import Navbar from "./Navbar";
import { FaMapMarkerAlt } from "react-icons/fa";
import { IoIosClose } from "react-icons/io"
import "./Home.css";

import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxOption,
} from "@reach/combobox";

import { Container, Card, ListGroup, Row, FormControl, InputGroup } from "react-bootstrap";

import mapStyles from "../../mapStyles";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

const libraries = ["places"];

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = {
  lat: 55.0103,
  lng: -1.44464,
  radius: 1000
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
  DELETE_MARKER: "delete-marker"
}

function reducer(markers, action) {
  switch(action.type){
    case ACTIONS.ADD_MARKERS: 
      return [...markers, ...action.payload.map((marker) => { return { geometry: { location: { lat: () => marker.coordinates.latitude, lng: () => marker.coordinates.longitude }}, ...marker }})]
    case ACTIONS.ADD_MARKER:
      return [...markers, { geometry: { location: {  lat: () => action.payload.coordinates.latitude,  lng: () => action.payload.coordinates.longitude }}, ...action.payload  }]
    case ACTIONS.UPDATE_MARKER: 
      return markers.map(marker => marker.id === action.payload.id ? {...marker, ...action.payload} : marker)
    case ACTIONS.DELETE_MARKER:
      return markers.filter(marker => marker.id !== action.payload.id) 
    case ACTIONS.RESET_MARKERS:
      return [];
    default:
      return markers
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
  const [selected, setSelected] = useState(null);
  const [radius, setRadius] = useState(1000);
  const [filterResults, setFilterResults] = useState(false);
  const [view, setView] = useState({ mapView: true });
  const [userDietaryProfile, setUserDietaryProfile ]= useState(null);
  const foodContext = useFood();
  const mapRef = useRef();
  const listeners = useRef([]);

  const onMapClick = useCallback((event) => {

    dispatch({ type: ACTIONS.ADD_MARKER, 
      payload: { 
      coordinates: { 
        latitude: event.latLng.lat(), 
        longitude: event.latLng.lng()
      }, tags: [], isNew: true } 
    });

  }, []);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setLocation(center);
  }, []);

  const fetchGoogleMarkers = ({lat,lng,radius}) => { 
      let service = new window.google.maps.places.PlacesService(mapRef.current);
      return new Promise((resolve, reject) => {
        service.nearbySearch({ type: "restaurant",  location: {lat, lng}, radius}, (results, status) => { 
          if(status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject([]);
          }
        });
      });
  }

 const fetchDatabaseMarkers = ({lat,lng,radius}) => {
  return geodatabase
  .restaurants
  .near({ center: geoPoint(lat,lng), radius: ((radius / 1000) * 1.6)})
  .limit(25);
 }

 const attachListener = (listener) => listeners.current.push(listener);

 const dettachListeners = () => listeners.current.forEach((listener) => listener());

// Returns an array of map markers for the users current location
  useEffect(() => {
   if(!location) return

    console.log("Fetching Map Markers ...", location);

    // Reset markers when the user changes location
    dispatch({type: ACTIONS.RESET_MARKERS });

    const obj =
    { lat: location.lat, 
      lng: location.lng, 
      radius: location.radius
    };

    // On inital load get Firestore Map Markers near the users location
    fetchDatabaseMarkers(obj).get().then((querySnapshot) => {
      
      let data = [];

      querySnapshot.forEach((doc) => {
        console.log(`Fetching Marker ${doc.id} from the database`);
        // doc.data() is never undefined for query doc snapshots
        data.push({...doc.data(), distance: parseFloat(doc.distance / 1.6).toFixed(1), id: doc.id});
      });

      dispatch({type: ACTIONS.ADD_MARKERS, payload: data })

      console.log(`Fetching Google Markers`);
      // Get the rest of the map marker data from Google
      fetchGoogleMarkers(obj).then((response) => { 
           
        // Filter Google Map Markers not in the database
        const newMarkers = response.filter((location) => !data.some((item) => item.g_place_id === location.place_id));

        // Are there any new map markers? If so add them to the database.
        if(newMarkers.length) newMarkers.forEach((marker) => {
            console.warn(`Adding Google Marker with id: ${marker.place_id} to the database`);
            geodatabase.restaurants.doc(marker.place_id).set({
              coordinates: geoPoint(marker.geometry.location.lat(), marker.geometry.location.lng()),
              g_place_id: marker.place_id,
              name: marker.name,
              tags: [],
              vicinity: marker.vicinity});
          }); 
      }).catch(error => console.error(error));

     const unsubscribe = fetchDatabaseMarkers(obj).onSnapshot(snapshot => {

        snapshot.docChanges().forEach((change) => {

          if(change.type === "removed") return dispatch({type: ACTIONS.DELETE_MARKER, payload: { id: change.doc.id  } });

          const changedata = {...change.doc.data(), distance: parseFloat(change.doc.distance / 1.6).toFixed(1), id: change.doc.id };

          if(change.type === "modified") return dispatch({type: ACTIONS.UPDATE_MARKER, payload: { ...changedata } });

          if(change.type === "added") return dispatch({type: !data.some((item) => item.id === changedata.id) && ACTIONS.ADD_MARKER, payload: { ...changedata }}); //CHECK IF ALREADY EXISTS 

        });

      }, (error) => console.log(error));

      attachListener(unsubscribe);

    }).catch(error => console.error(error));

    // Cleanup subscription on unmount
    return () => dettachListeners();
  
  }, [location]);

  useEffect((() => { 
    if(!selected) return
    if(!selected.isNew) setSelected(markers.find((item) => item.id === selected.id));   
  }),[selected, markers]);

  useEffect(() => {
    setUserDietaryProfile([...foodContext.selected.filter((item) => item.path.split("/")[0] === "dietaryconditions")])
  },[foodContext.selected]);

  useEffect(() => {
    if(!selected) return
    if(!userDietaryProfile) return
    if(!filterResults) return

    const keepSelected = userDietaryProfile.some((condition) => selected.tags.some((tag) => condition.name === tag));
    if(!keepSelected) setSelected(null);

  },[filterResults, selected, userDietaryProfile]);

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
    setLocation({lat, lng, radius});
  }, []);

  const interact = useLongPress({
    onLongPress: (ev) => onMapClick(ev),
    onClick: () => setSelected(null)
  });

 // Reference https://www.xspdf.com/help/50658711.html

  // Call when a user creates a new map marker
  const newMarker = useCallback(({lat,lng}) => {
    // Create a reference to the geolocation so it can be added to firestore
    const coordinates = geoPoint(lat, lng); 
    // Add a GeoDocument to a GeoCollection
    geodatabase.restaurants.add({name: 'Gareth', vicinity: "23 Tenbury Crescent", tags: ["Vegeterian", "Vegan", "Halal"], coordinates });
  }, []);

  // Call when a user updates an exisiting marker
  const editMarker = useCallback(() => {
    //geodatabase.restaurants.doc(id).set({name: 'Gareth', vicinity: "23 Tenbury Crescent", tags: ["Vegeterian", "Vegan", "Halal"], g_place_id: null, coordinates });
  }, []);

  const toggleView = useCallback(() => {
    if (!view) return 
    setView((prevState) => ({ mapView: !(prevState.mapView)}));
    setSelected(null);
  }, [view]);   

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";
  if(!userDietaryProfile) return "Loading...";

  const filterDC = (marker) => {
    if(!filterResults) return true
    if(marker.isNew) return true // Shows markers created by the user
    return userDietaryProfile.some((condition) => marker.tags.some((tag) => condition.name === tag))
  };

  return (
    <>
    <Container fluid>
      <h1>
        Food{" "}
        <span role="img" aria-label="bacon">
          🥓
        </span>
      </h1>
      <button type="button" onClick={toggleView}>{view.mapView ? "Map view" : "Card view" }</button>
      <button type="button" onClick={() => setFilterResults(!filterResults)}>{filterResults ? "Show All" : "Filter Dietary Profile" }</button>
      <Search panTo={panTo} />
      <Row>
        {filterResults && (
          <foodContext.FilterDietaryConditions/>
        )}
      </Row>

      <Locate panTo={panTo} />

      <div id="mapview" style={{display: view.mapView ? 'block' : 'none'}}>
      <GoogleMap
            {...interact}
            mapContainerStyle={mapContainerStyle}
            zoom={14}
            center={center}
            options={options}
            onLoad={onMapLoad}
          >
            {markers.map((marker, index) => filterDC(marker) && (
              <Marker
                key={index}
                animation={window.google.maps.Animation.Wp}
                position={{ lat: marker.geometry.location.lat(), lng: marker.geometry.location.lng()}}
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
            ))}
    
            {selected ? (
              <InfoWindow
                position={{ lat: selected.geometry.location.lat(), lng: selected.geometry.location.lng()}}
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
                        <ListGroup horizontal style={{display: "contents"}}>
                          {selected.tags.map((tag, i) => (
                            <ListGroup.Item key={i} variant="success" className="col-4 col-sm-auto col-md-auto col-lg-auto venuetag">{tag}</ListGroup.Item>
                            ))}
                      </ListGroup>
                      </Row>
                    </Container>
                  )}
                  <button className="mt-2" onClick={() => {
                    newMarker(({lat: selected.geometry.location.lat(), lng: selected.geometry.location.lng()}))}}>Save</button>
                </div>
              </InfoWindow>
            ) : null}
          </GoogleMap>      
      </div>
      <div id="cardview" style={{display: view.mapView ? 'none' : 'block'}}>
        {markers && (
          <h4>{markers.length > 0 ? `Found ${markers.length} matches` : "Oops! We couldn't find any restaurants matching your dietary conditions."}</h4>
        )}

        {markers.map((marker, index) => filterDC(marker) && ( 
          <Card key={index} bg="light">
            <Card.Body>
              <Card.Title as="h3">{marker.name ?? "Name"}</Card.Title>
                <Card.Text>
                {marker.distance && `${marker.distance} miles away`} <br/>
                <FaMapMarkerAlt color="#3083ff"/> {marker.vicinity ?? "Address"}
                </Card.Text>
                {marker.tags && (
                  <Container fluid>
                  <Row>
                  <ListGroup horizontal style={{display: "contents"}}>
                    {marker.tags.map((tag, i) => (
                    <ListGroup.Item key={i} variant="success" className="col-4 col-sm-auto col-md-auto col-lg-auto venuetag">{tag}</ListGroup.Item>
                    ))}
                  </ListGroup>
                  </Row>
                  </Container>
                )}
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
    <Navbar/>
    </>
  );
}

function Locate({ panTo }) {
  return (
    <button
      onClick={() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            panTo({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => null
        );
      }}
    >Locate</button>
  );
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
    debounce: 300
  });

  const searchBox = useRef();

  return (
    <div>
      <Combobox
        onSelect={async (address) => {
          setValue(address, false);
          clearSuggestions();

          try {
            const results = await getGeocode({address});
            const { lat, lng } = await getLatLng(results[0]);
            panTo({lat,lng})
          } catch (error) {
            console.error(error);
          }
          console.log(address);
        }}>

        <InputGroup size="lg">
          <FormControl ref={searchBox} value={value} onChange={(event) => {
            setValue(event.target.value);
          }} disabled={!ready} placeholder="Search" aria-label="Large" aria-describedby="inputGroup-sizing-sm" />
      
        <InputGroup.Append>
          {value && (
            <InputGroup.Text onClick={() => { setValue(null); clearSuggestions(); searchBox.current.value = ""}}><IoIosClose/></InputGroup.Text>
          )}
          <InputGroup.Text>Search</InputGroup.Text>
        </InputGroup.Append>
        </InputGroup>

        <div>
          {status === "OK" &&
            data.map(({ id, description }) => (
              <ComboboxOption key={id} value={description} />
            ))}
        </div>
      </Combobox>
    </div>
  );
}
