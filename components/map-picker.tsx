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

export default function MapPicker({ value, onChange, height = 240, zoom = 15, showSearch = true, showMyLocationButton = true }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const autocompleteInputRef = useRef<HTMLInputElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const [locating, setLocating] = useState(false);

  // Function to get location using Google Geolocation API directly
  const getLocationFromGoogle = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    try {
      console.log('=== GOOGLE GEOLOCATION API REQUEST ===');
      const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          considerIp: true,
        }),
      });

      const data = await response.json();
      console.log('Google Geolocation API response:', data);
      
      if (data.location) {
        return {
          lat: data.location.lat,
          lng: data.location.lng,
          accuracy: data.accuracy,
        };
      }
      return null;
    } catch (error) {
      console.error('Google Geolocation API error:', error);
      return null;
    }
  };

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      // eslint-disable-next-line no-console
      console.warn("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; MapPicker will not load Google Maps");
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

      // Define setPosition function first so it can be used in callbacks
      const setPosition = (lat: number, lng: number, shouldReverseGeocode = true) => {
        if (!mapInstanceRef.current || !markerRef.current) return;
        mapInstanceRef.current.setCenter({ lat, lng });
        mapInstanceRef.current.setZoom(zoom);
        markerRef.current.setPosition({ lat, lng });

        if (shouldReverseGeocode && geocoderRef.current) {
          geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;
              const useFormatted = () => onChange({ address, lat, lng });

              if (placesServiceRef.current && results[0].place_id) {
                placesServiceRef.current.getDetails({ placeId: results[0].place_id }, (place, plStatus) => {
                  if (plStatus === window.google.maps.places.PlacesServiceStatus.OK && place?.formatted_address) {
                    onChange({ address: place.formatted_address, lat, lng });
                  } else {
                    useFormatted();
                  }
                });
              } else {
                useFormatted();
              }
            } else {
              onChange({ address: `${lat}, ${lng}`, lat, lng });
            }
          });
        } else {
          onChange({ address: `${lat}, ${lng}`, lat, lng });
        }
      };

      // If no location provided, try to get user's current location
      // UPDATE: Disabled auto-detection due to network-based location inaccuracy
      // Users should manually use "Use my location" button or search/click on map
      if (value.lat === null || value.lng === null) {
        console.log('MapPicker: No location provided, showing default map view');
        // Don't auto-detect, just show default location
        initWithDefaultLocation();
      } else {
        console.log('MapPicker: Using provided location:', value.lat, value.lng);
        // Use provided location
        initWithDefaultLocation();
      }

      function initWithDefaultLocation() {
        if (!window.google || !mapRef.current) return;

        const center = {
          lat: value.lat ?? 28.6139, // Default to New Delhi
          lng: value.lng ?? 77.2090,
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

        // Setup the rest of the map functionality
        setupMapInteractions();
      }

      function setupMapInteractions() {
        if (showSearch && autocompleteInputRef.current) {
          const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInputRef.current, {
            fields: ["formatted_address", "geometry"],
          });
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place || !place.geometry || !place.geometry.location) return;
            const loc = place.geometry.location;
            const lat = loc.lat();
            const lng = loc.lng();
            const address = place.formatted_address || autocompleteInputRef.current?.value || "";
            onChange({ address, lat, lng });
            mapInstanceRef.current.setCenter({ lat, lng });
            mapInstanceRef.current.setZoom(zoom);
            markerRef.current.setPosition({ lat, lng });
          });
        }

        // Click to set marker
        mapInstanceRef.current.addListener("click", (e: any) => {
          if (!e?.latLng) return;
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          setPosition(lat, lng, true);
        });

        // If we already have lat/lng but no address, reverse geocode once
        if (value.lat && value.lng && (!value.address || value.address.trim() === '')) {
          setPosition(value.lat, value.lng, true);
        }
      }
    }

    // Cleanup not strictly necessary for script tag; map cleans up on unmount
  }, []); // initialize once

  useEffect(() => {
    // If external value changes, update marker/center
    if (mapInstanceRef.current && markerRef.current && value.lat && value.lng) {
      markerRef.current.setPosition({ lat: value.lat, lng: value.lng });
      mapInstanceRef.current.setCenter({ lat: value.lat, lng: value.lng });
    }
  }, [value.lat, value.lng]);

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
              onClick={async () => {
                if (!navigator.geolocation) return;
                setLocating(true);
                
                // Try Google Geolocation API first
                console.log('Trying Google Geolocation API first...');
                const googleLocation = await getLocationFromGoogle();
                
                if (googleLocation) {
                  const { lat, lng, accuracy } = googleLocation;
                  console.log('Using Google API location:', lat, lng, 'accuracy:', accuracy);
                  
                  if (geocoderRef.current) {
                    geocoderRef.current.geocode({ location: { lat, lng } }, (results: any, status: string) => {
                      const useFinal = (addr: string) => {
                        onChange({ address: addr, lat, lng });
                        if (markerRef.current && mapInstanceRef.current) {
                          markerRef.current.setPosition({ lat, lng });
                          mapInstanceRef.current.setCenter({ lat, lng });
                          mapInstanceRef.current.setZoom(zoom);
                        }
                        setLocating(false);
                      };
                      if (status === 'OK' && results && results[0]) {
                        useFinal(results[0].formatted_address || `${lat}, ${lng}`);
                      } else {
                        useFinal(`${lat}, ${lng}`);
                      }
                    });
                  } else {
                    onChange({ address: `${lat}, ${lng}`, lat, lng });
                    if (markerRef.current && mapInstanceRef.current) {
                      markerRef.current.setPosition({ lat, lng });
                      mapInstanceRef.current.setCenter({ lat, lng });
                      mapInstanceRef.current.setZoom(zoom);
                    }
                    setLocating(false);
                  }
                  return;
                }
                
                // Fall back to browser geolocation
                console.log('Google API failed or returned inaccurate location, trying browser GPS...');
                console.log('=== BROWSER GPS REQUEST (HIGH ACCURACY) ===');
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    console.log('Raw geolocation response:', {
                      latitude: pos.coords.latitude,
                      longitude: pos.coords.longitude,
                      accuracy: pos.coords.accuracy,
                      altitude: pos.coords.altitude,
                      altitudeAccuracy: pos.coords.altitudeAccuracy,
                      heading: pos.coords.heading,
                      speed: pos.coords.speed,
                      timestamp: pos.timestamp
                    });
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    console.log('Detected coordinates:', lat, lng);
                    console.log('Accuracy:', pos.coords.accuracy, 'meters');
                    console.log('Source:', pos.coords.accuracy < 50 ? '✅ GPS (High Accuracy)' : '⚠️ Network/WiFi (Low Accuracy)');
                    if (geocoderRef.current) {
                      geocoderRef.current.geocode({ location: { lat, lng } }, (results: any, status: string) => {
                        const useFinal = (addr: string) => {
                          onChange({ address: addr, lat, lng });
                          if (markerRef.current && mapInstanceRef.current) {
                            markerRef.current.setPosition({ lat, lng });
                            mapInstanceRef.current.setCenter({ lat, lng });
                            mapInstanceRef.current.setZoom(zoom);
                          }
                          setLocating(false);
                        };
                        if (status === 'OK' && results && results[0]) {
                          const first = results[0];
                          if (first.place_id && placesServiceRef.current) {
                            placesServiceRef.current.getDetails({ placeId: first.place_id, fields: ['name','formatted_address'] }, (place: any, s2: string) => {
                              if (s2 === 'OK' && place) {
                                useFinal(place.name || place.formatted_address || `${lat}, ${lng}`);
                              } else {
                                useFinal(first.formatted_address || `${lat}, ${lng}`);
                              }
                            });
                          } else {
                            useFinal(first.formatted_address || `${lat}, ${lng}`);
                          }
                        } else {
                          useFinal(`${lat}, ${lng}`);
                        }
                      });
                    } else {
                      onChange({ address: `${lat}, ${lng}`, lat, lng });
                      if (markerRef.current && mapInstanceRef.current) {
                        markerRef.current.setPosition({ lat, lng });
                        mapInstanceRef.current.setCenter({ lat, lng });
                        mapInstanceRef.current.setZoom(zoom);
                      }
                      setLocating(false);
                    }
                  },
                  (error) => {
                    console.error('=== GEOLOCATION ERROR ===');
                    console.error('Error code:', error.code);
                    console.error('Error message:', error.message);
                    console.error('Error codes: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT');
                    // ignore errors silently
                    setLocating(false);
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                  }
                );
              }}
              className="shrink-0 border rounded px-3 text-sm disabled:opacity-60"
              disabled={locating}
            >
              {locating ? 'Locating…' : 'Use my location'}
            </button>
          )}
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height }} className="rounded-lg overflow-hidden bg-muted" />
      {value.lat && value.lng && (
        <div className="text-xs text-muted-foreground">
          Coordinates: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
}
