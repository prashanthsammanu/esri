// MyOverlayComponent.js
import React, { useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';

const CustomWidget = ({ view }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    // Load the required Esri modules dynamically
    loadModules(['esri/widgets/Legend']).then(([Legend]) => {
      // Create a legend widget
      const legend = new Legend({
        view: view,
      });

      // Add the legend widget to the overlay component
      legend.container = overlayRef.current;
      legend.startup();

      // Clean up resources when component unmounts
      return () => {
        if (legend) {
          legend.destroy();
        }
      };
    });
  }, [view]);

  return <div ref={overlayRef} className="legend-container" />;
};

export default CustomWidget;
