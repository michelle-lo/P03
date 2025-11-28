"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [drinkName, setDrinkName] = useState("");
  const [date, setDate] = useState("");
  const [sweetness, setSweetness] = useState("");
  const [locationName, setLocationName] = useState("");
  const [rating, setRating] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  async function loadEntries() {
    try {
      const res = await fetch("/api/coffee");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Unable to load entries.");
    }
  }

  useEffect(() => {
    loadEntries();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg(null);

    if (!drinkName.trim() || !locationName.trim()) {
      setErrorMsg("Drink name and location are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/coffee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drink_name: drinkName,
          sweetness,
          location_name: locationName,
          rating,
          price,
          lat,
          lng,
          image_url: imageUrl,
          date,
        }),        
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Error creating entry.");
      } else {
        setEntries((prev) => [data, ...prev]);
        // Clear form
        setDrinkName("");
        setDate("");
        setSweetness("");
        setLocationName("");
        setRating("");
        setPrice("");
        setImageUrl("");
        setLat("");
        setLng("");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Server error creating entry.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/coffee/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Error deleting entry.");
        return;
      }
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      setErrorMsg("Server error deleting entry.");
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Coffee & Latte Log ☕</h1>
        <p className="subtitle">
          Track your drinks, date of visits, sweetness, and favorite cafés.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Drink name*
              <input
                value={drinkName}
                onChange={(e) => setDrinkName(e.target.value)}
                placeholder="Iced vanilla latte"
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
              />
            </label>

            <label>
              Latitude
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="41.5…"
              />
            </label>

            <label>
              Longitude
              <input
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-81.6…"
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
            {loading ? "Saving…" : "Add Drink"}
          </button>
        </form>

        {errorMsg && <p className="error">{errorMsg}</p>}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Your Drinks</h2>
          <span className="badge">{entries.length}</span>
        </div>

        {entries.length === 0 ? (
          <p className="empty">No drinks logged yet. Add your first above!</p>
        ) : (
          <ul className="entry-list">
            {entries.map((e) => (
              <li key={e.id} className="entry">
                <div className="entry-main">
                  <div className="entry-top">
                    <h3>{e.drink_name}</h3>
                    {e.rating && (
                      <span className="pill">⭐ {e.rating}/5</span>
                    )}
                    {e.sweetness && (
                      <span className="pill">🍯 {e.sweetness}/5</span>
                    )}
                    {e.price !== null && (
                      <span className="pill">
                        ${Number(e.price).toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="location">{e.location_name}</p>
                  {e.dessert && (
                    <p className="detail">Dessert pairing: {e.dessert}</p>
                  )}
                  {e.image_url && (
                    <img
                      src={e.image_url}
                      alt={e.drink_name}
                      className="thumb"
                    />
                  )}
                </div>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleDelete(e.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
