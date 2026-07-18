"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { AMENITIES, CATEGORY_ITEMS, PROPERTY_TYPES } from "@/lib/constants";

export type AdvancedFilters = {
  minPrice: string;
  maxPrice: string;
  propertyType: string;
  amenities: string[];
};

export function CategoryFilters({
  selectedPropertyType,
  selectedAmenities,
  onCategory,
  filters,
  onApply,
  onClear
}: {
  selectedPropertyType: string;
  selectedAmenities: string[];
  onCategory: (propertyType?: string, amenity?: string) => void;
  filters: AdvancedFilters;
  onApply: (filters: AdvancedFilters) => void;
  onClear: () => void;
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [draft, setDraft] = useState(filters);

  const toggleAmenity = (amenity: string) => {
    setDraft((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity]
    }));
  };

  return (
    <>
      <div className="category-strip">
        <div className="category-scroll">
          {CATEGORY_ITEMS.map((item) => {
            const active =
              (item.propertyType && selectedPropertyType === item.propertyType) ||
              (item.amenity && selectedAmenities.includes(item.amenity));
            return (
              <button
                key={item.label}
                type="button"
                className={active ? "category-item active" : "category-item"}
                onClick={() => onCategory(item.propertyType, item.amenity)}
              >
                <span>{item.icon}</span>
                <small>{item.label}</small>
              </button>
            );
          })}
        </div>
        <button
          className="filter-button"
          type="button"
          onClick={() => {
            setDraft(filters);
            setShowPanel(true);
          }}
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {showPanel && (
        <div className="modal-backdrop" onMouseDown={() => setShowPanel(false)}>
          <section className="filter-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <button className="icon-button" type="button" onClick={() => setShowPanel(false)}>
                <X size={20} />
              </button>
              <h2>Filters</h2>
              <span />
            </div>

            <div className="filter-section">
              <h3>Price range</h3>
              <p>Nightly prices before fees and taxes.</p>
              <div className="price-inputs">
                <label>
                  Minimum
                  <input
                    type="number"
                    min={0}
                    value={draft.minPrice}
                    onChange={(event) => setDraft({ ...draft, minPrice: event.target.value })}
                    placeholder="₹0"
                  />
                </label>
                <label>
                  Maximum
                  <input
                    type="number"
                    min={0}
                    value={draft.maxPrice}
                    onChange={(event) => setDraft({ ...draft, maxPrice: event.target.value })}
                    placeholder="₹20,000+"
                  />
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h3>Type of place</h3>
              <div className="chip-grid">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={draft.propertyType === type ? "select-chip selected" : "select-chip"}
                    onClick={() => setDraft({ ...draft, propertyType: draft.propertyType === type ? "" : type })}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Amenities</h3>
              <div className="checkbox-grid">
                {AMENITIES.map((amenity) => (
                  <label key={amenity} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={draft.amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  const empty = { minPrice: "", maxPrice: "", propertyType: "", amenities: [] };
                  setDraft(empty);
                  onClear();
                }}
              >
                Clear all
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => {
                  onApply(draft);
                  setShowPanel(false);
                }}
              >
                Show stays
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
