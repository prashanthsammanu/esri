import React, { useEffect, useRef } from "react";
import { loadModules } from "esri-loader";

const MapComponent = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    let view;

    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/widgets/LayerList",
        "esri/widgets/Expand",
        "esri/widgets/Popup",
        "esri/PopupTemplate",
        "esri/widgets/Slider",
        "esri/layers/GroupLayer",
        // other required modules
      ],
      { css: true }
    ).then(
      ([
        Map,
        MapView,
        FeatureLayer,
        LayerList,
        Expand,
        Popup,
        PopupTemplate,
        Slider,
        GroupLayer,
      ]) => {
        // Definition expressions to filter the features
        const countiesDefinitionExpression = `(countyname IN ('Mecklenburg','Gaston','Iredell','Catawba','Rowan','Lincoln','Cabarrus','Stanly','Cleveland','Union','Anson')) OR (countyname IN ('Chester','York','Lancaster'))`;
        const countiesDefinitionExpression1 = `(name IN ('Mecklenburg','Gaston','Iredell','Catawba','Rowan','Lincoln','Cabarrus','Stanly','Cleveland','Union','Anson')) OR (name IN ('Chester','York','Lancaster'))`;
        const countiesDefinitionExpression2 = `(countyname IN ('Mecklenburg','Gaston','Iredell','Catawba','Rowan','Lincoln','Cabarrus','Stanly','Cleveland','Union','Anson')) OR (countyname IN ('CHESTER','YORK','LANCASTER'))`;

        //Popup templates
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

        const censusPopupTemplate = new PopupTemplate({
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

        const citiesPopupTemplate = new PopupTemplate({
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

        // Define the three layers
        const countiesLayer = new FeatureLayer({
          /* Layer configuration */
          title: "counties",
          url: "https://services1.arcgis.com/uCzmkROI93nvI5HX/arcgis/rest/services/nc_sc_counties/FeatureServer",
          definitionExpression: countiesDefinitionExpression1,
          popupTemplate: popupTemplate,
          visible: false,
        });

        const censusTractsLayer = new FeatureLayer({
          title: "census tracts",
          url: "https://services1.arcgis.com/uCzmkROI93nvI5HX/arcgis/rest/services/nc_sc_census_tracts/FeatureServer",
          definitionExpression: countiesDefinitionExpression,
          popupTemplate: censusPopupTemplate,
          visible: true,
        });

        const cityBoundariesLayer = new FeatureLayer({
          /* Layer configuration */
          title: "city boundaries",
          url: "https://services1.arcgis.com/uCzmkROI93nvI5HX/arcgis/rest/services/city_boundaries_nc_sc/FeatureServer",
          definitionExpression: countiesDefinitionExpression2,
          popupTemplate: citiesPopupTemplate,
          visible: false,
        });

        // Add layers to the map
        // map.addMany([countiesLayer, censusTractsLayer, cityBoundariesLayer]);

        const demographicGroupLayer = new GroupLayer({
          title: "Charlotte Region Demographics",
          visible: true,
          visibilityMode: "exclusive",
          layers: [countiesLayer, censusTractsLayer, cityBoundariesLayer],
          opacity: 0.75,
        });

        const map = new Map({
          basemap: "streets-vector",
          layers: [demographicGroupLayer],
        });

        view = new MapView({
          container: mapRef.current,
          map: map,
          center: [-80.9795, 35.2271], // Center on North Carolina
          zoom: 7,
        });

        // Creates actions in the LayerList.
        async function defineActions(event) {
          // The event object contains an item property.
          // is is a ListItem referencing the associated layer
          // and other properties. You can control the visibility of the
          // item, its title, and actions using this object.

          const item = event.item;

          await item.layer.when();

          if (item.title === "Charlotte Region Demographics") {
            // An array of objects defining actions to place in the LayerList.
            // By making this array two-dimensional, you can separate similar
            // actions into separate groups with a breaking line.

            item.actionsSections = [
              [
                {
                  title: "Go to full extent",
                  className: "esri-icon-zoom-out-fixed",
                  id: "full-extent",
                },
                {
                  title: "Layer information",
                  className: "esri-icon-description",
                  id: "information",
                },
              ],
              [
                {
                  title: "Increase opacity",
                  className: "esri-icon-up",
                  id: "increase-opacity",
                },
                {
                  title: "Decrease opacity",
                  className: "esri-icon-down",
                  id: "decrease-opacity",
                },
              ],
            ];
          }

          // Adds a slider for updating a group layer's opacity
          if (item.children.length > 1 && item.parent) {
            const slider = new Slider({
              min: 0,
              max: 1,
              precision: 2,
              values: [1],
              visibleElements: {
                labels: true,
                rangeLabels: true,
              },
            });

            item.panel = {
              content: slider,
              className: "esri-icon-sliders-horizontal",
              title: "Change layer opacity",
            };

            slider.on("thumb-drag", (event) => {
              const { value } = event;
              item.layer.opacity = value;
            });
          }
        }

        view.when(() => {
          // Create the LayerList widget with the associated actions
          // and add it to the top-right corner of the view.

          const layerList = new LayerList({
            view: view,
            // executes for each ListItem in the LayerList
            listItemCreatedFunction: defineActions,
          });

          // Event listener that fires each time an action is triggered

          layerList.on("trigger-action", (event) => {
            // The layer visible in the view at the time of the trigger.
            const visibleLayer = [
              countiesLayer,
              cityBoundariesLayer,
              censusTractsLayer,
            ].find((layer) => layer.visible);

            // Capture the action id.
            const id = event.action.id;

            if (id === "full-extent") {
              // if the full-extent action is triggered then navigate
              // to the full extent of the visible layer
              view.goTo(visibleLayer.fullExtent).catch((error) => {
                if (error.name != "AbortError") {
                  console.error(error);
                }
              });
            } else if (id === "information") {
              // if the information action is triggered, then
              // open the item details page of the service layer
              window.open(visibleLayer.url);
            } else if (id === "increase-opacity") {
              // if the increase-opacity action is triggered, then
              // increase the opacity of the GroupLayer by 0.25

              if (demographicGroupLayer.opacity < 1) {
                demographicGroupLayer.opacity += 0.25;
              }
            } else if (id === "decrease-opacity") {
              // if the decrease-opacity action is triggered, then
              // decrease the opacity of the GroupLayer by 0.25

              if (demographicGroupLayer.opacity > 0) {
                demographicGroupLayer.opacity -= 0.25;
              }
            }
          });

          // Add widget to the top right corner of the view
          view.ui.add(layerList, "top-right");
        });
      }
    );

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, []);

  return (
    <div className="map-container" ref={mapRef} style={{ height: "100vh" }} />
  );
};

export default MapComponent;
