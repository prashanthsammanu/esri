import React, { useState, useEffect, useRef } from "react";
import { loadModules } from "esri-loader";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import esriConfig from "@arcgis/core/config";

const ScaleChart = ({ min, max, cityValue, nationValue }) => {
  const scaleWidth = max - min;
  const cityPosition = ((cityValue - min) / scaleWidth) * 100;
  const nationPosition = ((nationValue - min) / scaleWidth) * 100;

  return (
    <div className="chart-container">
      <svg className="chart" viewBox="0 0 100 10">
        <rect x="0" y="0" width="100" height="10" fill="lightgray" />
        <circle cx={cityPosition} cy="5" r="5" fill="orange" />
        <circle cx={nationPosition} cy="5" r="5" fill="blue" />
      </svg>
    </div>
  );
};

const MapComponent = () => {
  const mapRef = useRef(null);
  const [layerType, setLayerType] = useState("counties");

  // Definition expressions to filter the features
  const countiesDefinitionExpression = `(countyname IN ('Mecklenburg','Gaston','Iredell','Catawba','Rowan','Lincoln','Cabarrus','Stanly','Cleveland','Union','Anson')) OR (countyname IN ('Chester','York','Lancaster'))`;
  const  countiesDefinitionExpression1 = `(name IN ('Mecklenburg','Gaston','Iredell','Catawba','Rowan','Lincoln','Cabarrus','Stanly','Cleveland','Union','Anson')) OR (name IN ('Chester','York','Lancaster'))`;
  const countiesDefinitionExpression2 = `(countyname IN ('Mecklenburg','Gaston','Iredell','Catawba','Rowan','Lincoln','Cabarrus','Stanly','Cleveland','Union','Anson') AND stateName='') OR (countyname IN ('Chester','York','Lancaster'))`;
  
  useEffect(() => {
    let view;

    loadModules(
      [
        "esri/config",
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/widgets/Popup",
        "esri/PopupTemplate",
      ],
      { css: true }
    ).then(([esriConfig, Map, MapView, FeatureLayer, Popup, PopupTemplate]) => {
      esriConfig.apiKey =
        "AAPKfc0531ceea1e4e4ba449ee44ffb7b738llqmKzaR6-Oz_wxBRlOT9kP_kH2deWLOy-kbHrgGEJymMDfOyzGnjCh67U7NBhE5";

      const map = new Map({
        basemap: "streets-vector",
      });

      view = new MapView({
        container: mapRef.current,
        map: map,
        center: [-80.9795, 35.2271], // Center on North Carolina
        zoom: 7,
      });

      // Popup templates
      const popupTemplate = new PopupTemplate({
        title: "{Name}", // Specify the attribute field to display in the title
        content: [
          {
            // Specify content to show in the popup
            type: "fields",
            fieldInfos: [
              {
                fieldName: "namelsad",
                label: "County name",
              },
              // Add additional fields here
            ],
          },
        ],
      });

      const censuPopupTemplate = new PopupTemplate({
        title: "{tractce}", // Specify the attribute field to display in the title
        content: [
          {
            // Specify content to show in the popup
            type: "fields",
            fieldInfos: [
              {
                fieldName: "Name",
                label: "Name",
              },
              {
                fieldName: "Name",
                label: "Population",
              },
              // Add additional fields here
            ],
          },
        ],
      });

      const cititesPupupTemplate =   new PopupTemplate({
        title: "{COUNTY_NAM}", // Specify the attribute field to display in the title
        content: [
          {
            // Specify content to show in the popup
            type: "fields",
            fieldInfos: [
              {
                fieldName: "Population",
                label: "Population",
              },
              // Add additional fields here
            ],
          },
        ],
      });

      
      // Create layers with the definitionExpression set
      const countiesLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/uCzmkROI93nvI5HX/arcgis/rest/services/nc_sc_counties/FeatureServer",
        definitionExpression: countiesDefinitionExpression1,
        popupTemplate: popupTemplate,
        visible: layerType === "counties",
      });

      const censusTractsLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/uCzmkROI93nvI5HX/arcgis/rest/services/nc_sc_census_tracts/FeatureServer",
        definitionExpression: countiesDefinitionExpression,
        popupTemplate: censuPopupTemplate,
        visible: layerType === "tracts",
      });

      const cityBoundariesLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/uCzmkROI93nvI5HX/arcgis/rest/services/city_boundaries_nc_sc/FeatureServer",
        definitionExpression: countiesDefinitionExpression2,
        popupTemplate: cititesPupupTemplate,
        visible: layerType === "cities",
      });

      map.addMany([countiesLayer, censusTractsLayer, cityBoundariesLayer]);

      view.when(() => {
        // Function to update layer visibility based on the selected layer type
        const updateLayerVisibility = () => {
          countiesLayer.visible = layerType === "counties";
          censusTractsLayer.visible = layerType === "tracts";
          cityBoundariesLayer.visible = layerType === "cities";
        };
        updateLayerVisibility();

        countiesLayer
        .queryFeatures({
          where: "1=1", // Query all features
          returnGeometry: false, // Do not return geometry, only attributes
          outFields: ["*"], // Specify the fields to be returned
        })
        .then((result) => {
          // Access population data from the attributes of each feature
          const features = result.features;
          // console.log("features =====>", features.attributes);
          features.forEach((feature) => {
            const population = feature.attributes;
            console.log("Population:", feature.attributes);
          });
        })
        .catch((error) => {
          console.error("Error querying features:", error);
        });
      });
    });

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [layerType]);

  // Rest of your component...
  const handleLayerChange = (event) => {
    setLayerType(event.target.value);
  };

  return (
    <div>
      <select onChange={handleLayerChange} value={layerType}>
        <option value="counties">Counties</option>
        <option value="tracts">
          Tracts
        </option>
        <option value="cities">
          Boundaries
        </option>
      </select>
      <div className="map-container" ref={mapRef} style={{ height: 1000 }} />
    </div>
  );
};

export default MapComponent;
