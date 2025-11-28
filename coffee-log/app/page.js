"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const CoffeeMap = dynamic(() => import("../components/CoffeeMap"), {
  ssr: false,
});
import AddEntryModal from "../components/AddEntryModal";
import EntryDetailModal from "../components/EntryDetailModal";
import EditEntryModal from "../components/EditEntryModal";

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [sortKey, setSortKey] = useState("created_at"); // created_at | rating | sweetness | price
  const [sortDir, setSortDir] = useState("desc");
  const [addedByFilter, setAddedByFilter] = useState("");

  const [editingEntry, setEditingEntry] = useState(null);


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

  async function geocodeLocation(locationName) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      locationName
    )}`;

    const res = await fetch(url, {
      headers: {
        "Accept-Language": "en",
      },
    });

    if (!res.ok) {
      console.error("Geocode error:", res.status, res.statusText);
      return { lat: null, lng: null };
    }

    const data = await res.json();
    if (!data || data.length === 0) {
      console.warn("No geocode results for", locationName);
      return { lat: null, lng: null };
    }

    const first = data[0];
    return {
      lat: Number(first.lat),
      lng: Number(first.lon),
    };
  }

  useEffect(() => {
    loadEntries();
  }, []);

  // Called by AddEntryModal
  async function createEntry(formValues) {
    const {
      drinkName,
      date,
      sweetness,
      locationName,
      rating,
      price,
      image_url,
      added_by,
      notes
    } = formValues;

    if (!drinkName.trim() || !locationName.trim()) {
      return { ok: false, message: "Drink name and location are required." };
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      const { lat, lng } = await geocodeLocation(locationName);

      const res = await fetch("/api/coffee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drink_name: drinkName,
          sweetness,
          location_name: locationName,
          rating,
          price,
          image_url,
          lat,
          lng,
          date,
          added_by,
          notes
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data.error || "Error creating entry.";
        setErrorMsg(message);
        return { ok: false, message };
      } else {
        setEntries((prev) => [data, ...prev]);
        return { ok: true };
      }
    } catch (err) {
      console.error(err);
      const message = "Server error creating entry.";
      setErrorMsg(message);
      return { ok: false, message };
    } finally {
      setLoading(false);
    }
  }

  async function updateEntry(id, formValues) {
    const {
      drinkName,
      date,
      sweetness,
      locationName,
      rating,
      price,
      image_url,
      added_by,
      notes,
    } = formValues;
  
    if (!drinkName.trim() || !locationName.trim()) {
      return { ok: false, message: "Drink name and location are required." };
    }
  
    setErrorMsg(null);
    setLoading(true);
    try {
      // reuse your geocoding so map stays accurate
      const { lat, lng } = await geocodeLocation(locationName);
  
      const res = await fetch(`/api/coffee/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drink_name: drinkName,
          sweetness,
          location_name: locationName,
          rating,
          price,
          image_url,
          lat,
          lng,
          date,
          added_by,
          notes,
        }),
      });
  
      const data = await res.json();
      if (!res.ok) {
        const message = data.error || "Error updating entry.";
        setErrorMsg(message);
        return { ok: false, message };
      } else {
        // update in local state
        setEntries((prev) =>
          prev.map((e) => (e.id === data.id ? data : e))
        );
        return { ok: true };
      }
    } catch (err) {
      console.error(err);
      const message = "Server error updating entry.";
      setErrorMsg(message);
      return { ok: false, message };
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

  // Filter + sort entries for display + map
  const visibleEntries = useMemo(() => {
    let filtered = [...entries];

    if (addedByFilter.trim()) {
      const needle = addedByFilter.trim().toLowerCase();
      filtered = filtered.filter((e) =>
        (e.added_by || "").toLowerCase().includes(needle)
      );
    }

    filtered.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;

      const getVal = (entry) => {
        if (sortKey === "created_at") return entry.created_at || "";
        if (sortKey === "rating") return entry.rating ?? -Infinity;
        if (sortKey === "sweetness") return entry.sweetness ?? -Infinity;
        if (sortKey === "price") return Number(entry.price ?? -Infinity);
        return entry.created_at || "";
      };

      const va = getVal(a);
      const vb = getVal(b);

      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });

    return filtered;
  }, [entries, addedByFilter, sortKey, sortDir]);

  function handleSortChange(key) {
    if (sortKey === key) {
      // toggle direction
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <>
      <main className="page page-two-col">
        {/* LEFT: coffee log list + controls */}
        <div className="content-column">
          <section className="card">
            <div className="card-header">
              <div>
                <h1>Coffee & Latte Log ☕</h1>
                <p className="subtitle">
                  Track drinks, sweetness, price, and who logged them.
                </p>
              </div>
              <button type="button" onClick={() => setIsAddOpen(true)}>
                + Add Drink
              </button>
            </div>

            {errorMsg && <p className="error">{errorMsg}</p>}

            {/* Filters + sort controls */}
            <div className="controls-row">
              <div className="control-group">
                <span className="control-label">Sort by:</span>
                <button
                  type="button"
                  className={
                    sortKey === "created_at" ? "chip chip-active" : "chip"
                  }
                  onClick={() => handleSortChange("created_at")}
                >
                  Date {sortKey === "created_at" && (sortDir === "asc" ? "↑" : "↓")}
                </button>
                <button
                  type="button"
                  className={
                    sortKey === "rating" ? "chip chip-active" : "chip"
                  }
                  onClick={() => handleSortChange("rating")}
                >
                  Rating {sortKey === "rating" && (sortDir === "asc" ? "↑" : "↓")}
                </button>
                <button
                  type="button"
                  className={
                    sortKey === "sweetness" ? "chip chip-active" : "chip"
                  }
                  onClick={() => handleSortChange("sweetness")}
                >
                  Sweetness{" "}
                  {sortKey === "sweetness" && (sortDir === "asc" ? "↑" : "↓")}
                </button>
                <button
                  type="button"
                  className={
                    sortKey === "price" ? "chip chip-active" : "chip"
                  }
                  onClick={() => handleSortChange("price")}
                >
                  Price {sortKey === "price" && (sortDir === "asc" ? "↑" : "↓")}
                </button>
              </div>

              <div className="control-group">
                <span className="control-label">Filter by Logged By:</span>
                <input
                  className="small-input"
                  value={addedByFilter}
                  onChange={(e) => setAddedByFilter(e.target.value)}
                  placeholder="e.g. Michelle"
                />
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2>Coffee Log</h2>
              <span className="badge">{visibleEntries.length}</span>
            </div>

            {visibleEntries.length === 0 ? (
              <p className="empty">
                No drinks match this view. Try adding one or clearing filters.
              </p>
            ) : (
              <ul className="entry-list">
                {visibleEntries.map((e) => (
                  <li
                    key={e.id}
                    className="entry entry-clickable"
                    onClick={() => setSelectedEntry(e)}
                  >
                    <div className="entry-main">
                      <div className="entry-top">
                        <h3>{e.drink_name}</h3>
                        {e.rating && (
                          <span className="pill">⭐ {e.rating}/5</span>
                        )}
                        {e.sweetness && (
                          <span className="pill">🍯 {e.sweetness}/5</span>
                        )}
                        {e.price !== null && e.price !== undefined && (
                          <span className="pill">
                            ${Number(e.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="location">{e.location_name}</p>
                      {e.added_by && (
                        <p className="detail">Logged by {e.added_by}</p>
                      )}
                      {e.notes && (
                        <p className="detail">Notes: {e.notes}</p>
                      )}
                      {e.image_url && (
                        <img
                          src={e.image_url}
                          alt={e.drink_name}
                          className="thumb thumb-small"
                        />
                      )}
                    </div>
                  
                    <div className="entry-actions">
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setEditingEntry(e);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          handleDelete(e.id);
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* RIGHT: map column */}
        <aside className="map-column">
          <section className="card map-card">
            <h2>Cafés Map</h2>
            <p className="subtitle">
              View all visible entries on the map. Sorting/filtering also apply here.
            </p>
            <CoffeeMap entries={visibleEntries} />
          </section>
        </aside>
      </main>

      {/* Add-entry modal */}
      <AddEntryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreate={createEntry}
        loading={loading}
      />

      {/* Entry detail modal */}
      <EntryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />

      <EditEntryModal
        entry={editingEntry}
        isOpen={Boolean(editingEntry)}
        onClose={() => setEditingEntry(null)}
        onUpdate={updateEntry}
        loading={loading}
      />

    </>
  );
}
