import React, { useState, useRef, useEffect, useCallback, useReducer } from "react";
import { geodatabase, geoPoint } from "../../firebase/config"
import useLongPress from "../../useLongPress";
import { useFood } from "../../context/FoodContext";
import Navbar from "./Navbar";
import { FaMapMarkerAlt } from "react-icons/fa";
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

import { Container, Card, ListGroup, Row } from "react-bootstrap";

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

export default function Home() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    googleMaps: process.env.GOOGLE_MAPS_NEARBY_SEARCH,
    libraries,
  });

  const [markers, setMarkers] = useState([]);
  const [location, setLocation] = useState(null);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState({ mapView: true });
  const { userDietaryProfile } = useFood();
  const mapRef = useRef();

  const onMapClick = useCallback((event) => {
    setMarkers((current) => [
      ...current,
      { 
        geometry: {
          location: {
            lat: () => event.latLng.lat(),
            lng: () => event.latLng.lng(),
          }
        },
      },
     ]);
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

// Returns an array of map markers for the users current location
  useEffect(() => {
    if(!location) return
    console.log("Fetching Map Markers ...", location);

    // Reset markers when the user changes location
    setMarkers([]);

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

      setMarkers((current) => [...current,
        ...data.map((marker) => { return {"geometry": {"location": { 
          lat: () => marker.coordinates.latitude, 
          lng: () => marker.coordinates.longitude
        }}, ...marker }})]);

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

      fetchDatabaseMarkers(obj).onSnapshot(snapshot => {

        snapshot.docChanges().forEach((change) => {
  
          const changedata = {...change.doc.data(), distance: parseFloat(change.doc.distance / 1.6).toFixed(1), id: change.doc.id };

          const found = data.find((item) => item.id === changedata.id);
          
          if(!found) return setMarkers((current) => [
            ...current,
            { geometry: { location: { lat: () => changedata.coordinates.latitude,  lng: () => changedata.coordinates.longitude }}, ...changedata }
          ]);

          // Only update if dietary tags change
          if(changedata.tags.filter(arr => !found.tags.includes(arr)).length) return setMarkers((current) => [
            ...current,
            { geometry: { location: { lat: () => changedata.coordinates.latitude,  lng: () => changedata.coordinates.longitude }}, ...changedata }
          ]);
        });

      }, (error) => console.log(error));

    }).catch(error => console.error(error));

  }, [location]);

   useEffect((() => {
     if(!userDietaryProfile) return
        console.log(userDietaryProfile.current); // An array of objects containing dietary conditions of the user
    }),[]);

  useEffect((() => { console.log(`selected: `, selected)}),[selected])

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
    setLocation({lat, lng, radius: 1000});
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
      <Search panTo={panTo} />
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
            {markers.map((marker, index) => (
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
        {markers.map((marker, index) => ( 
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
  });

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
        }}
      >
        <ComboboxInput
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
          }}
          disabled={!ready}
          placeholder="Enter adreess"
        />
        <ComboboxPopover>
          {status === "OK" &&
            data.map(({ id, description }) => (
              <ComboboxOption key={id} value={description} />
            ))}
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
