"use client";

export default function EntryDetailModal({ entry, onClose }) {
  if (!entry) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{entry.drink_name}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <p className="location">{entry.location_name}</p>
        {entry.added_by && (
          <p className="detail">Logged by {entry.added_by}</p>
        )}
        {entry.date && (
          <p className="detail">
            Date: {new Date(entry.date).toLocaleDateString()}
          </p>
        )}

        <div className="detail-badges">
          {entry.rating && (
            <span className="pill">⭐ Rating: {entry.rating}/5</span>
          )}
          {entry.sweetness && (
            <span className="pill">🍯 Sweetness: {entry.sweetness}/5</span>
          )}
          {entry.price !== null && entry.price !== undefined && (
            <span className="pill">
              💵 ${Number(entry.price).toFixed(2)}
            </span>
          )}
        </div>

        {entry.notes && entry.notes.trim() && (
            <div className="notes-section">
                <h3 className="notes-title">Notes</h3>
                <p className="notes-body">{entry.notes}</p>
            </div>
        )}

        

        {entry.image_url && (
          <img
            src={entry.image_url}
            alt={entry.drink_name}
            className="detail-image"
          />
        )}
      </div>
    </div>
  );
}
