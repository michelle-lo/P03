"use client";

import { useState, useEffect } from "react";

export default function AddEntryModal({ isOpen, onClose, onCreate, loading }) {
  const [drinkName, setDrinkName] = useState("");
  const [date, setDate] = useState("");
  const [sweetness, setSweetness] = useState("");
  const [locationName, setLocationName] = useState("");
  const [rating, setRating] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [localError, setLocalError] = useState(null);

  // reset when opened
  useEffect(() => {
    if (isOpen) {
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    const result = await onCreate({
      drinkName,
      date,
      sweetness,
      locationName,
      rating,
      price,
      imageUrl,
      added_by: addedBy,
    });

    if (result.ok) {
      // clear & close on success
      setDrinkName("");
      setDate("");
      setSweetness("");
      setLocationName("");
      setRating("");
      setPrice("");
      setImageUrl("");
      setAddedBy("");
      onClose();
    } else {
      setLocalError(result.message || "Error creating entry.");
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Add New Drink</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
          >
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
                placeholder="Iced vanilla latte"
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

            <label>
              Location name*
              <input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Phoenix Coffee – Larchmere"
                required
              />
            </label>

            <label>
              Your name or nickname
              <input
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
                placeholder="Michelle, M.L., etc."
              />
            </label>

            <label className="full">
              Image URL
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
              />
            </label>
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
