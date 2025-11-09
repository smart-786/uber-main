import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
// UrlTile को इंपोर्ट करना अनिवार्य है
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { calculateRegion, generateMarkersFromData } from "@/lib/map";
// 'setDrivers' हटा दिया गया है क्योंकि यह इस कंपोनेंट में उपयोग नहीं हो रहा है।
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

// Geoapify Key को process.env से प्राप्त करें
const geoAPI = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  // ✅ FIX: 'setDrivers' को हटा दिया गया है (ESLint: 'setDrivers' is assigned a value but never used)
  const { selectedDriver } = useDriverStore();

  const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  useEffect(() => {
    if (Array.isArray(drivers) && userLatitude && userLongitude) {
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });
      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  // 🧭 Fetch route using Geoapify Directions API
  useEffect(() => {
    const fetchRoute = async () => {
      if (
        !destinationLatitude ||
        !destinationLongitude ||
        !userLatitude ||
        !userLongitude
      )
        return;

      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/routing?waypoints=50.96209827745463%2C4.414458883409225%7C50.429137079078345%2C5.00088081232559&mode=drive&apiKey=1fe53f28769a40f39a4c6ad6803e67f1`,
        );
        const data = await response.json();

        if (data?.features?.length > 0) {
          const geometry = data.features[0].geometry.coordinates[0];
          const coords = geometry.map(([lng, lat]: [number, number]) => ({
            latitude: lat,
            longitude: lng,
          }));
          setRouteCoords(coords);
        }
      } catch (err) {
        console.error("Geoapify route error:", err);
      }
    };

    // ✅ FIX: Promise returned from fetchRoute is ignored. IIFE का उपयोग करें।
    (async () => {
      await fetchRoute();
    })();
  }, [destinationLatitude, destinationLongitude, userLatitude, userLongitude]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  if (loading || !userLatitude || !userLongitude)
    return (
      <View className="flex justify-center items-center w-full h-full">
        <ActivityIndicator size="large" color="#0286FF" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-center items-center w-full h-full">
        <Text>Error loading map: {String(error)}</Text>
      </View>
    );

  return (
    <MapView
      // ✅ FIX TS2322: 'provider' एरर से बचने के लिए 'undefined' का उपयोग करें।
      // Geoapify टाइल्स का उपयोग करते समय किसी डिफ़ॉल्ट प्रोवाइडर की आवश्यकता नहीं होती है।
      provider={undefined}
      className="w-full h-full rounded-2xl"
      mapType="standard"
      showsPointsOfInterest={false}
      // ✅ FIX TS18047: 'region' को भेजने से पहले null/undefined चेक की आवश्यकता नहीं है,
      // क्योंकि 'if (!userLatitude)' जाँच पहले ही हो चुकी है।
      region={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {/* ⚠️ Geoapify Tiles को दिखाने के लिए यह आवश्यक है ⚠️ */}
      <UrlTile
        urlTemplate={`https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?&apiKey=1fe53f28769a40f39a4c6ad6803e67f1`}
        maximumZ={19}
      />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />

          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor="#0286FF"
              strokeWidth={4}
            />
          )}
        </>
      )}
    </MapView>
  );
};

export default Map;
