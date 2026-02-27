import React, { useState } from "react";
import { type TimelineItem as TimelineItemType } from "../types/Timeline";
import TimelineItem from "./TimelineItem";
import PhotoLightbox from "./PhotoLightbox";
import "./Timeline.css";

interface TimelineProps {
  items: TimelineItemType[];
  babyName: string;
  onDeleteItem: (id: string) => void;
  isAdmin: boolean;
}

const Timeline: React.FC<TimelineProps> = ({
  items,
  babyName,
  onDeleteItem,
  isAdmin,
}) => {
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    photo: string;
    title: string;
  } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  // Filter items based on selected category
  const filteredItems =
    selectedFilter === "all"
      ? items
      : items.filter((item) => item.category === selectedFilter);

  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const handlePhotoClick = (photo: string, title: string) => {
    setLightboxPhoto({ photo, title });
  };

  const closeLightbox = () => {
    setLightboxPhoto(null);
  };

  const filterOptions = [
    { value: "all", label: "All", emoji: "📅" },
    { value: "milestone", label: "Milestones", emoji: "🎯" },
    { value: "first", label: "First Times", emoji: "✨" },
    { value: "growth", label: "Growth", emoji: "📏" },
    { value: "fun", label: "Fun Moments", emoji: "🎉" },
  ];

  const getCategoryCount = (category: string) => {
    if (category === "all") return items.length;
    return items.filter((item) => item.category === category).length;
  };

  return (
    <div className="timeline-container">
      <h2 className="timeline-title">{babyName}'s Journey</h2>

      <div className="timeline-filters">
        <span className="filter-label">Filter by:</span>
        <div className="filter-buttons">
          {filterOptions.map((option) => {
            const count = getCategoryCount(option.value);
            return (
              <button
                key={option.value}
                className={`filter-btn ${
                  selectedFilter === option.value ? "active" : ""
                }`}
                onClick={() => setSelectedFilter(option.value)}
                disabled={count === 0 && option.value !== "all"}
              >
                <span className="filter-emoji">{option.emoji}</span>
                <span className="filter-text">
                  {option.label} {count > 0 && `(${count})`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="timeline">
        {sortedItems.length === 0 ? (
          <div className="timeline-empty">
            {filteredItems.length === 0 && selectedFilter !== "all" ? (
              <>
                <p>
                  No{" "}
                  {filterOptions
                    .find((opt) => opt.value === selectedFilter)
                    ?.label.toLowerCase()}{" "}
                  found!
                </p>
                <p>
                  <small>
                    Try selecting a different category or add some milestones.
                  </small>
                </p>
              </>
            ) : (
              <>
                <p>No milestones added yet to {babyName}'s shared timeline!</p>
                <p>
                  <small>
                    Admins can add milestones to document the journey.
                  </small>
                </p>
              </>
            )}
          </div>
        ) : (
          sortedItems.map((item, index) => (
            <TimelineItem
              key={item.id}
              item={item}
              position={index % 2 === 0 ? "left" : "right"}
              onDelete={onDeleteItem}
              onPhotoClick={handlePhotoClick}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>

      {lightboxPhoto && (
        <PhotoLightbox
          photo={lightboxPhoto.photo}
          title={lightboxPhoto.title}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
};

export default Timeline;
