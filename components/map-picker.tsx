"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export type MapPickerValue = {
  address: string;
  lat: number | null;
  lng: number | null;
};

type Props = {
  value: MapPickerValue;
  onChange: (val: MapPickerValue) => void;
  height?: number;
  zoom?: number;
  showSearch?: boolean;
  showMyLocationButton?: boolean;
};

export default function MapPicker({
  value,
  onChange,
  height = 240,
  zoom = 15,
  showSearch = true,
  showMyLocationButton = true,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const autocompleteInputRef = useRef<HTMLInputElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
      return;
    }

    const existing = document.getElementById("gmaps-script");
    if (existing) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.id = "gmaps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = init;
    document.head.appendChild(script);

    function init() {
      if (!window.google || !mapRef.current) return;

      const center = {
        lat: value.lat ?? 28.6139,
        lng: value.lng ?? 77.209,
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: value.lat && value.lng ? zoom : 12,
      });

      markerRef.current = new window.google.maps.Marker({
        position: value.lat && value.lng ? { lat: value.lat, lng: value.lng } : center,
        map: mapInstanceRef.current,
      });

      geocoderRef.current = new window.google.maps.Geocoder();
      placesServiceRef.current = new window.google.maps.places.PlacesService(mapInstanceRef.current);

      setupMapInteractions();
    }

    function setupMapInteractions() {
      if (showSearch && autocompleteInputRef.current) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteInputRef.current,
          {
            fields: ["formatted_address", "geometry"],
          }
        );
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place || !place.geometry) return;

          const loc = place.geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          const address = place.formatted_address || "";

          onChange({ address, lat, lng });
          markerRef.current.setPosition({ lat, lng });
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(zoom);
        });
      }

      mapInstanceRef.current.addListener("click", (e: any) => {
        if (!e?.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        reverseGeocodeAndSet(lat, lng);
      });

      if (value.lat && value.lng && (!value.address || value.address.trim() === "")) {
        reverseGeocodeAndSet(value.lat, value.lng);
      }
    }

    function reverseGeocodeAndSet(lat: number, lng: number) {
      if (!geocoderRef.current) return;
      geocoderRef.current.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          const address = results[0].formatted_address;
          onChange({ address, lat, lng });
        } else {
          onChange({ address: `${lat}, ${lng}`, lat, lng });
        }

        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setPosition({ lat, lng });
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(zoom);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && value.lat && value.lng) {
      markerRef.current.setPosition({ lat: value.lat, lng: value.lng });
      mapInstanceRef.current.setCenter({ lat: value.lat, lng: value.lng });
    }
  }, [value.lat, value.lng]);

  const locateUser = () => {
    if (!navigator.geolocation) return;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!geocoderRef.current) return;

        geocoderRef.current.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          const address =
            status === "OK" && results && results[0]
              ? results[0].formatted_address
              : `${lat}, ${lng}`;

          onChange({ address, lat, lng });

          if (markerRef.current && mapInstanceRef.current) {
            markerRef.current.setPosition({ lat, lng });
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(zoom);
          }

          setLocating(false);
        });
      },
      () => setLocating(false),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div className="space-y-2">
      {showSearch && (
        <div className="flex gap-2">
          <input
            ref={autocompleteInputRef}
            type="text"
            defaultValue={value.address}
            placeholder="Search address or place"
            className="w-full border rounded px-3 py-2 text-sm"
          />
          {showMyLocationButton && (
            <button
              type="button"
              onClick={locateUser}
              className="shrink-0 border rounded px-3 text-sm disabled:opacity-60"
              disabled={locating}
            >
              {locating ? "Locating…" : "Use my location"}
            </button>
          )}
        </div>
      )}

      <div
        ref={mapRef}
        style={{ width: "100%", height }}
        className="rounded-lg overflow-hidden bg-muted"
      />

      {value.lat && value.lng && (
        <div className="text-xs text-muted-foreground">
          Coordinates: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
