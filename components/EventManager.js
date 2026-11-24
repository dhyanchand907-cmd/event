"use client";

import { useEffect, useState } from "react";
import { EVENT_TYPES, STATUSES } from "@/lib/constants";

const emptyForm = {
  eventName: "",
  description: "",
  eventDate: "",
  venue: "",
  eventType: EVENT_TYPES[0],
  status: STATUSES[0],
};

// Dates are stored as UTC midnight, so format in UTC to avoid off-by-one days.
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function byDate(a, b) {
  return new Date(a.eventDate) - new Date(b.eventDate);
}

export default function EventManager({ currentUserId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function request(url, options) {
    const res = await fetch(url, options);
    if (res.status === 401) {
      window.location.href = "/login"; // session expired
      throw new Error("Session expired.");
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    return data;
  }

  useEffect(() => {
    request("/api/events")
      .then((data) => setEvents(data.events))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(event) {
    setEditingId(event._id);
    setForm({
      eventName: event.eventName,
      description: event.description,
      eventDate: event.eventDate.slice(0, 10),
      venue: event.venue,
      eventType: event.eventType,
      status: event.status,
    });
    setFormError("");
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setFormError("");
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (editingId) {
        // UPDATE
        const { event } = await request(`/api/events/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setEvents((prev) => prev.map((x) => (x._id === editingId ? event : x)).sort(byDate));
      } else {
        // CREATE
        const { event } = await request("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setEvents((prev) => [...prev, event].sort(byDate));
      }
      closeForm();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // DELETE
  async function handleDelete(event) {
    if (!window.confirm(`Delete "${event.eventName}"? This cannot be undone.`)) return;
    setError("");
    try {
      await request(`/api/events/${event._id}`, { method: "DELETE" });
      setEvents((prev) => prev.filter((x) => x._id !== event._id));
      if (editingId === event._id) closeForm();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="section-head">
        <div>
          <h1>Events</h1>
          <p className="muted">
            {loading ? "Loading..." : `${events.length} event${events.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {!formOpen && (
          <button className="btn primary" onClick={openCreate}>
            + New event
          </button>
        )}
      </div>

      {error && <div className="alert">{error}</div>}

      {formOpen && (
        <form className="card event-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit event" : "New event"}</h2>
          {formError && <div className="alert">{formError}</div>}

          <div className="grid">
            <label className="span-2">
              Event name
              <input name="eventName" value={form.eventName} onChange={handleChange} required />
            </label>

            <label className="span-2">
              Description
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Event date
              <input
                name="eventDate"
                type="date"
                value={form.eventDate}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Venue
              <input name="venue" value={form.venue} onChange={handleChange} required />
            </label>

            <label>
              Event type
              <select name="eventType" value={form.eventType} onChange={handleChange}>
                {EVENT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="actions">
            <button type="button" className="btn" onClick={closeForm}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Create event"}
            </button>
          </div>
        </form>
      )}

      {!loading && events.length === 0 && !error && (
        <div className="card empty">
          <p>No events yet. Click “New event” to add the first one.</p>
        </div>
      )}

      <div className="event-list">
        {events.map((event) => {
          const isOwner = event.createdBy?.id === currentUserId;
          return (
            <article className="card event" key={event._id}>
              <div className="event-top">
                <h3>{event.eventName}</h3>
                <span className={`badge ${event.status.toLowerCase()}`}>{event.status}</span>
              </div>

              <p className="meta">
                <span>{formatDate(event.eventDate)}</span>
                <span>·</span>
                <span>{event.venue}</span>
                <span>·</span>
                <span>{event.eventType}</span>
              </p>

              <p className="desc">{event.description}</p>

              <div className="event-foot">
                <span className="muted small">By {event.createdBy?.name ?? "Unknown"}</span>
                {isOwner && (
                  <div className="actions">
                    <button className="btn small" onClick={() => openEdit(event)}>
                      Edit
                    </button>
                    <button className="btn small danger" onClick={() => handleDelete(event)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
