import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CITY_COORDS = {
  "Chicago": [41.8827, -87.6233],
  "New York": [40.7128, -74.0060],
  "Los Angeles": [34.0522, -118.2437],
  "Houston": [29.7604, -95.3698],
  "San Francisco": [37.7749, -122.4194],
  "Denver": [39.7392, -104.9903],
  "Dallas": [32.7767, -96.7970],
  "Seattle": [47.6062, -122.3321],
  "Atlanta": [33.7490, -84.3880],
  "Phoenix": [33.4484, -112.0740],
  "Minneapolis": [44.9778, -93.2650],
  "Boston": [42.3601, -71.0589],
  "Miami": [25.7617, -80.1918],
};

function formatPrice(listing) {
  if (listing.price_type === "free") return "Free";
  if (!listing.price) return "Contact";
  return `$${listing.price.toLocaleString()}`;
}

export default function MapView({ listings }) {
  const withCoords = listings
    .map((l) => ({ ...l, coords: CITY_COORDS[l.location_city] }))
    .filter((l) => l.coords);

  const center = withCoords.length > 0 ? withCoords[0].coords : [41.88, -87.63];

  return (
    <div className="h-[60vh] rounded-2xl overflow-hidden border border-border/50 shadow-sm">
      <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }} className="z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((listing) => (
          <Marker key={listing.id} position={listing.coords}>
            <Popup>
              <div className="min-w-[160px]">
                {listing.images?.[0] && (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-20 object-cover rounded mb-2" />
                )}
                <p className="font-semibold text-xs leading-tight mb-1">{listing.title}</p>
                <p className="text-primary font-bold text-sm mb-2">{formatPrice(listing)}</p>
                <Link
                  to={`/listing/${listing.id}`}
                  className="block text-center text-xs bg-primary text-white rounded-lg py-1.5 font-medium"
                >
                  View Listing
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}