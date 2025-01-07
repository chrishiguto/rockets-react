import { MapContainerProps, Marker } from 'react-leaflet';
import { MarkerClusterGroupOptions } from 'leaflet';

import MarkerClusterGroup from './MarkerClusterGroup';
import Map from './Map';

import 'leaflet.markercluster/dist/MarkerCluster.css';

type Position = {
  lat: number;
  lon: number;
};

export type MapMarkerClusterProps = {
  data: Position[];
  markerClusterProps?: MarkerClusterGroupOptions;
} & MapContainerProps;

const MapMarkerCluster = ({
  data,
  markerClusterProps,
  ...props
}: MapMarkerClusterProps) => (
  <Map {...props}>
    <MarkerClusterGroup showCoverageOnHover={false} {...markerClusterProps}>
      {data.map((address, index) => {
        const { lat, lon } = address;

        // Loose equality to check for `undefined` or `null`
        if (lat == undefined || lon == undefined) {
          return null;
        }

        return <Marker key={`${lat}-${lon}-${index}`} position={[lat, lon]} />;
      })}
    </MarkerClusterGroup>
  </Map>
);

export default MapMarkerCluster;
