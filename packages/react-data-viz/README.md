# @concepta/react-data-viz

## Introduction

The primary goal of this package is to provide easy-to-use, out-of-the-box data visualization components. Aligned with the mission of Rockets to offer a comprehensive end-to-end application, this package contributes by providing maps and charts for data visualization management.

We offer maps and charts that can be used with any dataset, as well as pre-integrated components designed to work seamlessly with third-party data visualization platforms.

## Folder Structure

The folder structure is straightforward and designed with simplicity in mind. We separate `charts` and `maps`, allowing them to be imported directly from their respective folders.

`import { MapMarkerCluster } from '@rockets/react-data-viz/maps`

Alternatively, they can be imported from the main entry point:

`import { MapMarkerCluster } from '@rockets/react-data-viz`

```
react-data-viz
├── src
│   ├── charts
│   ├── maps
│   │   └── MapMarkerCluster.tsx
│   ├── integrations
│   │   └── cube
│   │       └── MapMarkerCluster.tsx
│   └── index.ts
```

The integrations with third-party libraries are located in the `integrations` folder. These integrations consist of chart and map components built on top of specific third-party APIs.

This structure keeps the core functionality decoupled from the integrations, ensuring smooth extensibility and easier integration of third-party libraries.

## Peer dependencies

This package leverages both `leaflet` and `react-leaflet` package to implement the map components. While the map components are included in the package, their dependencies are not bundled as required dependencies, nor are they installed by default.

To use the map components, developers must manually install the `leaflet` and `react-leaflet` dependencies in their project. For detailed installation instructions, refer to the official documentation: [React-Leaflet Start Guide](https://react-leaflet.js.org/docs/start-introduction/).

This approach helps maintain a smaller bundle size by exporting only the necessary code and avoiding unnecessary dependencies in the core package.

## Installation

To install `@concepta/react-data-viz`, run the following command:

```bash
npm install @concepta/react-data-viz
```

or with yarn:

```bash
yarn add @concepta/react-data-viz
```
