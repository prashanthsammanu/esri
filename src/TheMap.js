import React, { useState, useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import esriConfig from "@arcgis/core/config";

const TheMap = () => {
  const mapRef = useRef(null);
  const [layerType, setLayerType] = useState("counties");

  const countiesDefinitionExpression = `countyname IN ('Mecklenburg', 'Gaston', 'Iredell', 'Catawba', 'Rowan', 'Lincoln', 'Cabarrus', 'Stanly', 'Cleveland', 'Union', 'Anson', 'Chester', 'York', 'Lancaster')`;

  useEffect(() => {
    esriConfig.apiKey = "your-api-key"; 

    const map = new Map({
      basemap: "streets-vector"
    });

    const view = new MapView({
      container: mapRef.current,
      map: map,
      center: [-80.9795, 35.2271], 
      zoom: 7
    });

    const popupTemplate = new PopupTemplate({
      title: "{NAME}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "Population",
              label: "Population"
            }
          ]
        }
      ]
    });

    const layers = {
      counties: new FeatureLayer({
        url: "your-url", 
        definitionExpression: countiesDefinitionExpression,
        popupTemplate: popupTemplate,
        visible: layerType === "counties"
      }),
      tracts: new FeatureLayer({
        url: "your-url", 
        definitionExpression: countiesDefinitionExpression,
        popupTemplate: popupTemplate,
        visible: layerType === "tracts"
      }),
      cities: new FeatureLayer({
        url: "your-url", 
        definitionExpression: countiesDefinitionExpression,
        popupTemplate: popupTemplate,
        visible: layerType === "cities"
      })
    };

    map.addMany([layers.counties, layers.tracts, layers.cities]);

    view.when(() => {
      const updateLayerVisibility = (layerType) => {
        layers.counties.visible = layerType === "counties";
        layers.tracts.visible = layerType === "tracts";
        layers.cities.visible = layerType === "cities";
      };

      updateLayerVisibility(layerType);

      return () => {
        if (view) {
          view.destroy();
        }
      };
    });
  }, [layerType]);

  const handleLayerChange = (event) => {
    setLayerType(event.target.value);
  };

  const min = 5;
  const max = 61;
  const cityValue = 21.4;
  const nationValue = 23.6;

  return (
    <div>
      <ScaleChart min={min} max={max} cityValue={cityValue} nationValue={nationValue} />
      <select onChange={handleLayerChange} value={layerType}>
        <option value="counties">Counties</option>
        <option value="tracts">Census Tracts</option>
        <option value="cities">City Boundaries</option>
      </select>
      <div className="map-container" ref={mapRef} style={{ height: "60vh" }} />
    </div>
  );
};

export default TheMap;