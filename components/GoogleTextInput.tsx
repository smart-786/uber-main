import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

// 👇 Your Geoapify API key (from .env)
const GEOAPIFY_API_KEY =
  process.env.EXPO_PUBLIC_PLACES_API_KEY || "1fe53f28769a40f39a4c6ad6803e67f1";

// 👇 Define the type of each suggestion result from Geoapify
type GeoapifyPlace = {
  place_id: string;
  formatted: string;
  lat: number;
  lon: number;
};

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoapifyPlace[]>([]);

  // 👇 Fetch suggestions from Geoapify
  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          text,
        )}&format=json&apiKey=${GEOAPIFY_API_KEY}`,
      );
      const data = await response.json();
      // Defensive check
      if (data && Array.isArray(data.results)) {
        setSuggestions(
          data.results.map((item: any) => ({
            place_id: item.place_id,
            formatted: item.formatted,
            lat: item.lat,
            lon: item.lon,
          })),
        );
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Geoapify Error:", error);
    }
  };

  const onSelectPlace = (place: GeoapifyPlace) => {
    setQuery(place.formatted);
    setSuggestions([]);
    handlePress({
      latitude: place.lat,
      longitude: place.lon,
      address: place.formatted,
    });
  };

  return (
    <View
      className={`flex flex-col relative rounded-xl ${containerStyle}`}
      style={{
        backgroundColor: textInputBackgroundColor || "white",
        padding: 8,
      }}
    >
      {/* 🔍 Input field */}
      <View className="flex flex-row items-center gap-2">
        <Image
          source={icon ? icon : icons.search}
          className="w-6 h-6"
          resizeMode="contain"
        />
        <TextInput
          value={query}
          placeholder={initialLocation ?? "Where do you want to go?"}
          placeholderTextColor="gray"
          onChangeText={fetchSuggestions}
          className="flex-1 text-[16px] font-semibold text-black"
        />
      </View>

      {/* 📍 Dropdown list */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelectPlace(item)}
              className="p-3 border-b border-gray-200"
            >
              <Text className="text-[15px] text-black">{item.formatted}</Text>
            </TouchableOpacity>
          )}
          style={{
            maxHeight: 200,
            backgroundColor: textInputBackgroundColor || "white",
            borderRadius: 8,
            position: "absolute",
            top: 55,
            left: 0,
            right: 0,
            zIndex: 999,
            elevation: 5,
          }}
        />
      )}
    </View>
  );
};

export default GoogleTextInput;
