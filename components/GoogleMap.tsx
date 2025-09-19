"use client";

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface MapIssue {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  location: string;
  coordinates: { lat: number; lng: number };
  reportedDate: string;
  description: string;
  reporter: string;
  photos: number;
}

interface GoogleMapProps {
  issues: MapIssue[];
  selectedIssue: MapIssue | null;
  onIssueSelect: (issue: MapIssue) => void;
  heatmapEnabled: boolean;
  mapView: string;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  issues,
  selectedIssue,
  onIssueSelect,
  heatmapEnabled,
  mapView,
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Category colors for markers
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      pothole: '#8b5cf6',
      streetlight: '#06b6d4', 
      garbage: '#10b981',
      'water-leak': '#f59e0b',
      traffic: '#ef4444',
      other: '#6b7280'
    };
    return colors[category] || colors.other;
  };

  // Priority sizes for markers
  const getPrioritySize = (priority: string) => {
    const sizes: { [key: string]: number } = {
      high: 12,
      medium: 10,
      low: 8
    };
    return sizes[priority] || sizes.medium;
  };

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      if (isLoaded) return;
      
      try {
        console.log('GoogleMap: Initializing with API key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing');
        
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: 'weekly',
          libraries: ['visualization']
        });

        await loader.load();
        console.log('Google Maps API loaded successfully');
        
        // Use a more reliable way to wait for DOM
        const waitForElement = () => {
          return new Promise<void>((resolve) => {
            const checkElement = () => {
              if (mapRef.current) {
                resolve();
              } else {
                setTimeout(checkElement, 50);
              }
            };
            checkElement();
          });
        };
        
        await waitForElement();
        
        if (mapRef.current) {
          console.log('Creating map instance...');
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 28.4744, lng: 77.5040 },
            zoom: 12,
            mapTypeId: getMapType(mapView),
            styles: getMapStyles()
          });

          mapInstanceRef.current = map;
          setIsLoaded(true);
          console.log('Map instance created and loaded successfully');
        }
      } catch (err) {
        console.error('Google Maps loading error:', err);
        setError('Failed to load Google Maps');
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(initializeMap, 100);
    return () => {
      clearTimeout(timer);
      // Cleanup markers when component unmounts
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
      }
    };
  }, [mapView]);

  // Update map type when mapView changes
  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      mapInstanceRef.current.setMapTypeId(getMapType(mapView));
    }
  }, [mapView, isLoaded]);

  // Update markers when issues change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) {
      return;
    }

    console.log('GoogleMap: Updating markers with', issues.length, 'issues');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    issues.forEach((issue, index) => {
      if (!issue.coordinates || !issue.coordinates.lat || !issue.coordinates.lng) {
        return;
      }

      const marker = new google.maps.Marker({
        position: issue.coordinates,
        map: mapInstanceRef.current,
        title: issue.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: getCategoryColor(issue.category),
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: getPrioritySize(issue.priority)
        },
        animation: issue.priority === 'high' ? google.maps.Animation.BOUNCE : undefined
      });

      // Add click listener
      marker.addListener('click', () => {
        onIssueSelect(issue);
      });

      markersRef.current.push(marker);
    });

    console.log(`GoogleMap: Created ${markersRef.current.length} markers`);

    // Adjust map bounds to fit all markers
    if (issues.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      issues.forEach(issue => {
        if (issue.coordinates) {
          bounds.extend(issue.coordinates);
        }
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [issues, isLoaded, onIssueSelect]);

  // Update heatmap
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Remove existing heatmap
    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
    }

    // Add heatmap if enabled
    if (heatmapEnabled && issues.length > 0) {
      const heatmapData = issues.map(issue => {
        const weight = issue.priority === 'high' ? 3 : issue.priority === 'medium' ? 2 : 1;
        return {
          location: new google.maps.LatLng(issue.coordinates.lat, issue.coordinates.lng),
          weight
        };
      });

      heatmapRef.current = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: mapInstanceRef.current,
        radius: 50,
        opacity: 0.6,
        gradient: [
          'rgba(0, 255, 255, 0)',
          'rgba(0, 255, 255, 1)',
          'rgba(0, 191, 255, 1)', 
          'rgba(0, 127, 255, 1)',
          'rgba(0, 63, 255, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(0, 0, 223, 1)',
          'rgba(0, 0, 191, 1)',
          'rgba(0, 0, 159, 1)',
          'rgba(0, 0, 127, 1)',
          'rgba(63, 0, 91, 1)',
          'rgba(127, 0, 63, 1)',
          'rgba(191, 0, 31, 1)',
          'rgba(255, 0, 0, 1)'
        ]
      });
    }
  }, [heatmapEnabled, issues, isLoaded]);

  // Helper functions
  const getMapType = (view: string): google.maps.MapTypeId => {
    switch (view) {
      case 'satellite': return google.maps.MapTypeId.SATELLITE;
      case 'terrain': return google.maps.MapTypeId.TERRAIN;
      case 'street':
      default: return google.maps.MapTypeId.ROADMAP;
    }
  };

  const getMapStyles = () => {
    // Optional: Custom map styling
    return [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ];
  };

  console.log('GoogleMap render:', { isLoaded, error, issuesCount: issues.length });
  
  return (
    <div className={className}>
      {/* Always render the map container */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {/* Loading overlay */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading Google Maps...</p>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center p-4">
            <p className="text-red-500 mb-2">Failed to load Google Maps</p>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <p className="text-xs text-gray-500 mb-4">This might be due to an ad blocker. Please disable it for this site or use the fallback view.</p>
            {/* Fallback static map */}
            <div className="mt-4 p-4 bg-white rounded border max-h-64 overflow-y-auto">
              <h4 className="font-medium mb-2">Issue Locations (Fallback View)</h4>
              <div className="space-y-2 text-sm">
                {issues.map((issue, index) => (
                  <div key={issue.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(issue.category) }}></div>
                    <span className="font-medium">{issue.title}</span>
                    <span className="text-gray-500">({issue.coordinates?.lat?.toFixed(4)}, {issue.coordinates?.lng?.toFixed(4)})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <h4 className="font-medium mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Potholes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
            <span>Streetlights</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Garbage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Water Leaks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Traffic</span>
          </div>
        </div>
        
        {heatmapEnabled && (
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-gray-600">🔥 Heatmap shows issue density</p>
          </div>
        )}
      </div>

      {/* Issue count indicator */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{issues.length} issues</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;