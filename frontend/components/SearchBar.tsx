"use client";

import { Search } from "lucide-react";
import { FormEvent } from "react";

export type SearchValues = {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export function SearchBar({
  values,
  onChange,
  onSubmit
}: {
  values: SearchValues;
  onChange: (values: SearchValues) => void;
  onSubmit: () => void;
}) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className="search-bar" onSubmit={submit}>
      <label className="search-field search-location">
        <span>Where</span>
        <input
          value={values.location}
          onChange={(event) => onChange({ ...values, location: event.target.value })}
          placeholder="Search destinations"
        />
      </label>
      <label className="search-field">
        <span>Check in</span>
        <input
          type="date"
          value={values.checkIn}
          onChange={(event) => onChange({ ...values, checkIn: event.target.value })}
        />
      </label>
      <label className="search-field">
        <span>Check out</span>
        <input
          type="date"
          value={values.checkOut}
          onChange={(event) => onChange({ ...values, checkOut: event.target.value })}
        />
      </label>
      <label className="search-field guest-field">
        <span>Who</span>
        <input
          type="number"
          min={1}
          max={30}
          value={values.guests}
          onChange={(event) => onChange({ ...values, guests: Math.max(1, Number(event.target.value) || 1) })}
        />
      </label>
      <button className="search-submit" type="submit" aria-label="Search">
        <Search size={20} />
        <span>Search</span>
      </button>
    </form>
  );
}
