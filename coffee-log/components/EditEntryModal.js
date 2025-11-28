"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function EditEntryModal({ entry, isOpen, onClose, onUpdate, loading }) {
  const [drinkName, setDrinkName] = useState("");
  const [date, setDate] = useState("");
  const [sweetness, setSweetness] = useState("");
  const [locationName, setLocationName] = useState("");
  const [rating, setRating] = useState("");
  const [price, setPrice] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [notes, setNotes] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [localError, setLocalError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && entry) {
      setLocalError(null);

      setDrinkName(entry.drink_name || "");
      setDate(entry.date ? entry.date.slice(0, 10) : ""); // YYYY-MM-DD
      setSweetness(entry.sweetness ?? "");
      setLocationName(entry.location_name || "");
      setRating(entry.rating ?? "");
      setPrice(entry.price ?? "");
      setAddedBy(entry.added_by || "");
      setNotes(entry.notes || "");

      setImageFile(null);
      setPreviewUrl(entry.image_url || null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isOpen, entry]);

  if (!isOpen || !entry) return null;

  async function uploadImage(file) {
    if (!file) return null;

    const fileName = `edit-${entry.id}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("coffee-images")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("coffee-images")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    let imageUrlToUse = entry.image_url || null;

    if (imageFile) {
      const uploadedImageUrl = await uploadImage(imageFile);
      if (!uploadedImageUrl) {
        setLocalError("Image upload failed");
        return;
      }
      imageUrlToUse = uploadedImageUrl;
    }

    const result = await onUpdate(entry.id, {
      drinkName,
      date,
      sweetness,
      locationName,
      rating,
      price,
      image_url: imageUrlToUse,
      added_by: addedBy,
      notes,
    });

    if (result.ok) {
      onClose();
    } else {
      setLocalError(result.message || "Error updating entry.");
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(entry.image_url || null);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Drink</h2>
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
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
                onChange={(e) => setLocationName(e.target.value)}
                required
              />
            </label>

            <label>
              Your name or nickname
              <input
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
              />
            </label>

            <label>
              Replace Image
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
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
            {loading ? "Saving…" : "Save Changes"}
          </button>

          {localError && <p className="error">{localError}</p>}
        </form>
      </div>
    </div>
  );
}
