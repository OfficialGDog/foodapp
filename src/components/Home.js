import React, { useState, useRef, useEffect, useCallback } from "react";
import useLongPress from "../useLongPress";
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

import mapStyles from "../mapStyles";

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
/*  const getMarkers = async () => { 
     try {
      const promise1 = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${location.radius}&type=restaurant&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);
      const promise2 = await fetch("http://localhost:3001/api/v1/location/list");
      let [data1, data2] = await Promise.all([promise1.json(), promise2.json()]);
      return [...data1.results, ...data2.sightings.map(marker => { return { geometry: { location: { lat: marker.location.coordinates[1], lng: marker.location.coordinates[0] }}, id: marker._id }})];
    } catch (error) {
      throw(error);
    }
  } */

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

  useEffect(() => {
    if(!initLoad.current) {
      initLoad.current = true;
      return
    }

    try {
      const service = new window.google.maps.places.PlacesService(mapRef.current);
      service.nearbySearch({ type: "restaurant",  location: {lat: location.lat, lng: location.lng}, radius: location.radius }, (results, status) => { 
        if(status === window.google.maps.places.PlacesServiceStatus.OK) {
          setMarkers(results);
        } else {
          throw Error(status);
        }
      });
    } catch (error) {
      console.error(error);
    }
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
    <div>
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
              <h2>{selected.name ?? "Title"}</h2>
              <p>{selected.vicinity ?? "description"}</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
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
