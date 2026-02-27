import React, { useState } from "react";
import { type TimelineItem } from "../types/Timeline";
import "./AddMilestone.css";

interface AddMilestoneProps {
  onAdd: (item: Omit<TimelineItem, "id">) => void;
  onClose: () => void;
}

const AddMilestone: React.FC<AddMilestoneProps> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<TimelineItem["category"]>("milestone");
  const [photo, setPhoto] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !date || !description) {
      alert("Please fill in all required fields");
      return;
    }

    onAdd({
      title: title.trim(),
      date,
      description: description.trim(),
      category,
      photo: photo.trim() || undefined,
    });

    // Reset form
    setTitle("");
    setDate("");
    setDescription("");
    setCategory("milestone");
    setPhoto("");
    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Milestone</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="milestone-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., First smile, First steps"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as TimelineItem["category"])
              }
            >
              <option value="milestone">🌟 Milestone</option>
              <option value="first">✨ First Time</option>
              <option value="growth">📏 Growth</option>
              <option value="fun">🎉 Fun Moment</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this special moment..."
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="photo">Photo</label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoUpload}
            />
            {photo && (
              <div className="photo-preview">
                <img src={photo} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="add-button">
              Add Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMilestone;
