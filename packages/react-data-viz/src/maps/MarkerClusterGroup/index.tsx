// The following code is based on the implementation from the repository:
// https://github.com/yuzhva/react-leaflet-markercluster
// Due to its simplicity, we decided to integrate it directly into our project
// for better maintainability and to reduce external dependencies.

import React from 'react';
import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.markercluster';

import 'leaflet.markercluster/dist/MarkerCluster.css';
import './styles.css';

L.MarkerClusterGroup.include({
  _flushLayerBuffer() {
    this.addLayers(this._layerBuffer);
    this._layerBuffer = [];
  },

  addLayer(layer) {
    if (this._layerBuffer.length === 0) {
      setTimeout(this._flushLayerBuffer.bind(this), 50);
    }
    this._layerBuffer.push(layer);
  },
});

L.MarkerClusterGroup.addInitHook(function () {
  this._layerBuffer = [];
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createMarkerCluster({ children: _c, ...props }, context) {
  const clusterProps: L.MarkerClusterGroupOptions = {};
  const clusterEvents: L.LayerEvent = {} as L.LayerEvent;

  // Splitting props and events to different objects
  Object.entries(props).forEach(([propName, prop]) =>
    propName.startsWith('on')
      ? (clusterEvents[propName] = prop)
      : (clusterProps[propName] = prop),
  );
  const instance = new L.MarkerClusterGroup(clusterProps);

  // Initializing event listeners
  Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
    const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`;
    instance.on(clusterEvent, callback);
  });
  return {
    instance,
    context: {
      ...context,
      layerContainer: instance,
    },
  };
}

const MarkerCluster = createPathComponent(createMarkerCluster);

const withRemovedNullishChildren = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return ({ children, ...props }: { children?: React.ReactNode } & P) => {
    // Filter out nullish or invalid children
    const validChildren = React.Children.toArray(children).filter(Boolean);

    // Spread props excluding `children`
    return <Component {...(props as P)}>{validChildren}</Component>;
  };
};

export default withRemovedNullishChildren(MarkerCluster);
