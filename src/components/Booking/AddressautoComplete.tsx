import { regionCountryMap } from "@/utils/regionMap";
import { useEffect, useRef } from "react";

type Props = {
  onSelect?: (place: { address: string; lat: number; lng: number }) => void;
  onChange?: (val: string) => void; // NEW
  region: string;
  value: string;
  disabledPickup: boolean;
};

export default function AddressAutocomplete({ onSelect, onChange, region, value  }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;
    const countryCode = regionCountryMap[region] || undefined;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
      ...(countryCode && { componentRestrictions: { country: countryCode } }),
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const result = {
        address: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      onSelect?.(result);
    });
  }, [region]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange?.(e.target.value)} // ✅ update parent state
      placeholder="Search address..."
      className="w-full border p-2 rounded-md text-sm"
    />
  );
}
