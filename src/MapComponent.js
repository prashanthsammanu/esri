import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "./AppContext";
import LinearGauge from "./LinearGauge";
import "./App.css";
import { setDefaultOptions, loadModules } from 'esri-loader';
// Set the version of the ArcGIS API for JavaScript you want to use
setDefaultOptions({ version: '4.28' });


const MapComponent = () => {
  const [isLinearGaugeVisible, setLinearGaugeVisibility] = useState(false);

  const toggleLinearGauge = () => {
    setLinearGaugeVisibility(!isLinearGaugeVisible);
  };

  const mapRef = useRef(null);
  const { setGlobalFID } = useAppContext();

  const handleFIDChange = (fid) => {
    // Some logic to get the new FID
    const newFID = fid; /* your logic here */

    // Set the new FID in the global state
    setGlobalFID(newFID);
  };

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
        "esri/widgets/Legend",
        "esri/widgets/ScaleBar",
        "esri/widgets/BasemapGallery",
        "esri/widgets/Home",
        "esri/widgets/Print",
        "esri/widgets/TimeSlider",
        "esri/widgets/ScaleRangeSlider",
        "esri/widgets/ValuePicker"
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
        Legend,
        ScaleBar,
        BasemapGallery,
        Home,
        Print,
        TimeSlider,
        ScaleRangeSlider,
        ValuePicker,
      ]) => {
        // Definition expressions to filter the features
        const countiesDefinitionExpression = `(countyname IN ('Mecklenburg','Gaston','Iredell','Catawba','Rowan','Lincoln','Cabarrus','Stanly','Cleveland','Union','Anson')) OR (countyname IN ('Chester','York','Lancaster'))`;
        const countiesDefinitionExpression1 = `(name IN ('Mecklenburg','Gaston','Iredell','Catawba','Rowan','Lincoln','Cabarrus','Stanly','Cleveland','Union','Anson')) OR (name IN ('Chester','York','Lancaster'))`;
        const countiesDefinitionExpression2 = `(countyname IN ('Mecklenburg','Gaston','Iredell','Catawba','Rowan','Lincoln','Cabarrus','Stanly','Cleveland','Union','Anson')) OR (countyname IN ('CHESTER','YORK','LANCASTER'))`;
        // const countiesDefinitionExpression3 = `state_fips IN (37, 45)`;

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

        // Define the static layer
        const staticCountiesLayer = new FeatureLayer({
          title: "Charlotte Region",
          url: "https://services1.arcgis.com/uCzmkROI93nvI5HX/arcgis/rest/services/Charlotte_Dissolve_Merge/FeatureServer",
          popupTemplate: popupTemplate, // You may want to customize this popup template for the static layer
          visible: true, // Set to true to show by default
        });

        // Define the three layers
        const countiesLayer = new FeatureLayer({
          /* Layer configuration */
          title: "Counties",
          url: "https://services1.arcgis.com/uCzmkROI93nvI5HX/arcgis/rest/services/counties_charlotte_data_updated/FeatureServer",
          definitionExpression: countiesDefinitionExpression1,
          popupTemplate: popupTemplate,
          visible: false,
        });

        const censusTractsLayer = new FeatureLayer({
          title: "Census Tracts",
          url: "https://services1.arcgis.com/uCzmkROI93nvI5HX/arcgis/rest/services/charlotte_censustracts_updated/FeatureServer",
          definitionExpression: countiesDefinitionExpression,
          popupTemplate: censusPopupTemplate,
          visible: false,
        });

        const cityBoundariesLayer = new FeatureLayer({
          /* Layer configuration */
          title: "Cities",
          url: "https://services1.arcgis.com/uCzmkROI93nvI5HX/arcgis/rest/services/city_boundaries_nc_sc/FeatureServer",
          // url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities_/FeatureServer",
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
          layers: [demographicGroupLayer, staticCountiesLayer],
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

          // Add click event listener to the view
          view.on("click", (event) => {
            console.log(event);
            // Identify the clicked feature
            view.hitTest(event).then((response) => {
              const { results } = response;
              if (results.length > 0) {
                const clickedFeature = results[0].graphic;
                const population = clickedFeature.attributes.FID;
                handleFIDChange(Math.floor(population / 100));
              }
            });
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
              view.goTo(visibleLayer.fullExtent).catch((error) => {
                if (error.name != "AbortError") {
                  console.error(error);
                }
              });
            } else if (id === "information") {
              window.open(visibleLayer.url);
            } else if (id === "increase-opacity") {
              if (demographicGroupLayer.opacity < 1) {
                demographicGroupLayer.opacity += 0.25;
              }
            } else if (id === "decrease-opacity") {
              if (demographicGroupLayer.opacity > 0) {
                demographicGroupLayer.opacity -= 0.25;
              }
            }
          });

          // Add widget to the top right corner of the view
          view.ui.add(layerList, "top-right");

          //Legends
          const legend = new Legend({
            view: view,
            layerInfos: [
              {
                layer: countiesLayer,
                title: "Counties",
              },
              {
                layer: censusTractsLayer,
                title: "Census Tracts",
              },
              {
                layer: cityBoundariesLayer,
                title: "Cities",
              },
            ],
          });
          view.ui.add(legend, "top-right");

          //BasemapGallery widget
          const basemapGallery = new BasemapGallery({
            view: view,
            container: document.createElement("div"),
          });
          const expandBasemapGallery = new Expand({
            view: view,
            content: basemapGallery.domNode, // Put the BasemapGallery inside the Expand widget
            expanded: false, // Start with the gallery collapsed
            expandIconClass: "esri-icon-basemap", // Icon for the expand widget
            expandTooltip: "Show Basemap Gallery", // Tooltip text
          });

          view.ui.add(expandBasemapGallery, "top-left");

          //Home Widget
          const homeWidget = new Home({
            view: view,
          });
          view.ui.add(homeWidget, "top-left");

          //Print Widget
          const printWidget = new Print({
            view: view,
            printServiceUrl:
              "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
            container: document.createElement("div"),
          });
          const expandPrint = new Expand({
            view: view,
            content: printWidget.domNode,
            expanded: false,
            expandIconClass: "esri-icon-printer",
            expandTooltip: "Print",
          });
          view.ui.add(expandPrint, "top-left");

          //ValuePicker

          const valuePicker = new ValuePicker({
            component: {
              type: "combobox",
              placeholder: "Pick Year",
              items: [
                { value: "2021", label: "2021"},
                { value: "2020", label: "2020"}
              ]
            },
            values: ["2021"]
          });
          view.ui.add(valuePicker, "top-right");


          let comboboxVariables = [
            {value:'munder5e',label:'Male Under 5'},
            {value:'m5to9e',label:'Male 5 to 9'},
            {value:'m10to14e',label:'Male 10 to 14'},
            {value:'m15to17e',label:'Male 15 to 17'},
            {value:'funder5e',label:'Female Under 5'},
            {value:'f5to9e',label:'Female 5 to 9'},
            {value:'f10to14e',label:'Female 10 to 14'},
            {value:'f15to17e',label:'Female 15 to 17'}];

          const metricValuePicker = new ValuePicker({
            visibleElements: {
              playButton: false
            },
            component: {
              type: "combobox",
              placeholder: "Metric",
              items: comboboxVariables,
            },
            values: [comboboxVariables[0].value]
          });
          view.ui.add(metricValuePicker, "top-right");
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
    <div style={{ position: "relative", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
          position: "absolute",
          bottom: 20,
          left: 15,
          zIndex: 1,
          padding: "2px",
          backgroundColor: "white",
        }}
      >
        {isLinearGaugeVisible && (
          <div>
            <LinearGauge />
          </div>
          //
        )}
        <button className="toggleButton button" onClick={toggleLinearGauge}>
          {isLinearGaugeVisible ? "Hide" : "Show"}
        </button>
      </div>
      <div className="map-container" ref={mapRef} style={{ height: "100vh" }} />
    </div>
  );
};

export default MapComponent;
