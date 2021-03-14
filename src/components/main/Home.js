import React, { useState, useRef, useEffect, useCallback } from "react";
import useLongPress from "../../useLongPress";
import Navbar from "./Navbar";
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

import { Container  } from "react-bootstrap";

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

async function newMarkerRequest(locationData) {

  const response = await fetch("http://localhost:3001/api/v1/location/new", {
    method: "POST",
    headers:{
      "Content-Type": "application/json",
    },
    body: JSON.stringify({location: locationData }),
  });

  const { location } = await response.json();
  return location;
}

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    googleMaps: process.env.GOOGLE_MAPS_NEARBY_SEARCH,
    libraries,
  });

  const [markers, setMarkers] = useState([]);
  const [location, setLocation] = useState(null);
  const initLoad = useRef(false);

  const onMapClick = useCallback((event) => {
    setMarkers((current) => [
      ...current,
     {
      lat: event.latLng.lat(),
         lng: event.latLng.lng(),
      },
     ]);

 //   newMarkerRequest( {
  //    lat: event.latLng.lat(),
  //    lng: event.latLng.lng(),
 //   });
  }, []);

  
  const [selected, setSelected] = useState(null);

  const mapRef = useRef();

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setLocation(center);
  }, []);

  const fetchGoogleMarkers = async () => { 

      let service = new window.google.maps.places.PlacesService(mapRef.current);

      return await new Promise((resolve, reject) => {
        service.nearbySearch({ type: "restaurant",  location: {lat: location.lat, lng: location.lng}, radius: location.radius }, (results, status) => { 
          if(status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject([]);
          }
        });
      });

 }

 const fetchDatabaseMarkers = async () => {
  let response = await fetch(`http://localhost:3001/api/v1/location/get?lat=${location.lat}&lng=${location.lng}&radius=10000`);
  let data = response.json();
  return [...data.map(sighting => { return { lat: sighting.location.coordinates[1], lng: sighting.location.coordinates[0] } })]
 }

  useEffect(() => {
    if(!initLoad.current) {
      initLoad.current = true;
      return
    }

    fetchGoogleMarkers().then(response => (
      setMarkers(response)
    )).catch(error => console.log(error));

    fetchDatabaseMarkers().then(response => (
      setMarkers(response)
    )).catch(error => console.log(error));

  }, [location]);

  const panTo = useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
    setLocation({lat, lng, radius: 1000});
  }, []);

  const interact = useLongPress({
    onLongPress: (ev) => onMapClick(ev),
    onClick: () => setSelected(null)
  });

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
      <Search panTo={panTo} />
      <Locate panTo={panTo} />

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
            position={{ lat: marker.geometry?.location?.lat() || marker.lat, lng: marker.geometry?.location?.lng() || marker.lng }}
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
            position={{ lat: selected.geometry?.location?.lat() || selected.lat, lng: selected.geometry?.location?.lng() || selected.lng }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h5>{selected.name ?? "Title"}</h5>
              <span>{selected.vicinity ?? "description"}</span>
              <ul>
                <li>Vegeterian</li>
                <li>Vegan</li>
                <li>Hindu</li>
              </ul>
              <button>Add</button>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
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
