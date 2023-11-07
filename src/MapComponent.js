import React, { useState, useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import esriConfig from "@arcgis/core/config";

const MapComponent = () => {
  const mapRef = useRef(null);
  const [layerType, setLayerType] = useState("counties"); // Default layer type

  // Handle the dropdown change for the layer type
  const handleLayerChange = (event) => {
    setLayerType(event.target.value);
  };

  useEffect(() => {
    // Set the ArcGIS API for JavaScript API key
    esriConfig.apiKey =
      "AAPKfc0531ceea1e4e4ba449ee44ffb7b738llqmKzaR6-Oz_wxBRlOT9kP_kH2deWLOy-kbHrgGEJymMDfOyzGnjCh67U7NBhE5";

    // Create the Map
    const map = new Map({
      basemap: "streets-vector", // Basemap layer service
    });

    // Create the MapView
    const view = new MapView({
      container: mapRef.current, // Reference to the DOM node that will contain the view
      map: map,
      center: [-80.943139, 35.219618], // Longitude, latitude
      zoom: 6,
    });

    // Definition expression for counties in NC and SC
    const countyFilterExpression = [
      "(STATE_FIPS = '37' AND CNTY_FIPS IN ('119', '071', '097','035','159','109','025','167','045','179','007'))",
      "(STATE_FIPS = '45' AND CNTY_FIPS IN ('023', '091', '057'))",
    ].join(" OR ");

    // Feature layer for USA counties
    const countiesLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Counties_Generalized/FeatureServer/0",
      definitionExpression: countyFilterExpression,
      outFields: ["*"], // Adjust as needed
      visible: layerType === "counties",
    });

    // Feature layer for USA census tracts
    const censusTractsLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_Tracts/FeatureServer/0",
      definitionExpression: countyFilterExpression,
      outFields: ["*"], // Adjust as needed
      visible: layerType === "tracts",
    });

    // Add the feature layers to the map
    map.addMany([countiesLayer, censusTractsLayer]);

    // Cleanup function to run when the component is unmounted
    return () => {
      if (view) {
        view.container = null; // To prevent potential memory leaks
      }
    };
  }, [layerType]); // Rerun the effect if layerType changes

  return (
    <div>
      <select onChange={handleLayerChange} value={layerType}>
        <option value="counties">Counties</option>
        <option value="tracts">Census Tracts</option>
        {/* Add more options as needed */}
      </select>
      <div
        className="map-container"
        style={{ height: "1000px", width: "100%" }}
        ref={mapRef}
      ></div>
    </div>
  );
};

export default MapComponent;
