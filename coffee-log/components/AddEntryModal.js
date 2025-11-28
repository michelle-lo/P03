"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AddEntryModal({ isOpen, onClose, onCreate, loading }) {
  const [drinkName, setDrinkName] = useState("");
  const [date, setDate] = useState("");
  const [sweetness, setSweetness] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const locationSearchTimeout = useRef(null);


  const [rating, setRating] = useState("");
  const [price, setPrice] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [notes, setNotes] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function uploadImage(file) {
    if (!file) return null;

    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("coffee-images")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("coffee-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    let uploadedImageUrl = null;

    // Upload before creating entry
    if (imageFile) {
      uploadedImageUrl = await uploadImage(imageFile);
      if (!uploadedImageUrl) {
        setLocalError("Image upload failed");
        return;
      }
    }

    const result = await onCreate({
      drinkName,
      date,
      sweetness,
      locationName,
      rating,
      price,
      image_url: uploadedImageUrl,
      added_by: addedBy,
      notes
    });

    if (result.ok) {
      setDrinkName("");
      setDate("");
      setSweetness("");
      setLocationName("");
      setRating("");
      setPrice("");
      setAddedBy("");
      setNotes("");
      setImageFile(null);
      setPreviewUrl(null);
      onClose();
    } else {
      setLocalError(result.message || "Error creating entry.");
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }

  async function fetchLocationSuggestions(query) {
    if (!query.trim()) {
      setLocationSuggestions([]);
      return;
    }
  
    try {
      setLocationLoading(true);
      const res = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
  
      if (!res.ok) {
        console.error("Location suggestions error:", res.statusText);
        setLocationSuggestions([]);
        return;
      }
  
      const data = await res.json();
      setLocationSuggestions(data || []);
    } catch (err) {
      console.error("Location suggestions error:", err);
      setLocationSuggestions([]);
    } finally {
      setLocationLoading(false);
    }
  }
  

  function handleLocationChange(e) {
    const value = e.target.value;
    setLocationName(value);
  
    if (locationSearchTimeout.current) {
      clearTimeout(locationSearchTimeout.current);
    }
  
    locationSearchTimeout.current = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);
  }
  
  function handleLocationPick(option) {
    setLocationName(option.display_name);
    setLocationSuggestions([]);
  }
  
  

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Drink</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">

            <label>
              Drink name*
              <input
                value={drinkName}
                onChange={(e) => setDrinkName(e.target.value)}
                required
              />
            </label>

            <label>
              Date of Visit*
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            <label>
              Sweetness (1–5)
              <input
                type="number"
                min="1"
                max="5"
                value={sweetness}
                onChange={(e) => setSweetness(e.target.value)}
              />
            </label>

            <label>
              Rating (1–5)
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </label>

            <label>
              Price ($)
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>

            <label className="full">
                Location name*
                <input
                    value={locationName}
                    onChange={handleLocationChange}
                    placeholder="Start typing a café or address"
                    required
                />

                {locationLoading && (
                    <div className="location-suggestions">
                    <div className="location-suggestion">Searching…</div>
                    </div>
                )}

                {!locationLoading && locationSuggestions.length > 0 && (
                    <div className="location-suggestions">
                    {locationSuggestions.map((opt) => (
                        <button
                        type="button"
                        key={opt.place_id}
                        className="location-suggestion"
                        onClick={() => handleLocationPick(opt)}
                        >
                        <div className="location-suggestion-name">
                            {opt.display_name}
                        </div>
                        </button>
                    ))}
                    </div>
                )}
            </label>



            <label>
              Your name or nickname
              <input
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
              />
            </label>

            <label>
              Upload Image
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>

            <label className="full">
              Notes
              <input
              
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            {previewUrl && (
              <div className="image-preview full">
                <img src={previewUrl} alt="preview" />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save Entry"}
          </button>

          {localError && <p className="error">{localError}</p>}
        </form>
      </div>
    </div>
  );
}
