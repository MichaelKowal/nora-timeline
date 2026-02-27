import React from "react";
import { type TimelineItem as TimelineItemType } from "../types/Timeline";
import "./TimelineItem.css";

interface TimelineItemProps {
  item: TimelineItemType;
  position: "left" | "right";
  onDelete: (id: string) => void;
  onPhotoClick: (photo: string, title: string) => void;
  isAdmin: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  position,
  onDelete,
  onPhotoClick,
  isAdmin,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getCategoryIcon = (category?: TimelineItemType["category"]) => {
    switch (category) {
      case "milestone":
        return "🌟";
      case "first":
        return "✨";
      case "growth":
        return "📏";
      case "fun":
        return "🎉";
      default:
        return "💖";
    }
  };

  return (
    <div className={`timeline-item ${position}`}>
      <div className="timeline-content">
        <div className="timeline-card">
          <div className="timeline-header">
            <span className="timeline-category">
              {getCategoryIcon(item.category)}
            </span>
            {isAdmin && (
              <button
                className="delete-button"
                onClick={() => onDelete(item.id)}
                title="Delete milestone"
              >
                ×
              </button>
            )}
          </div>

          {item.photo && (
            <div
              className="timeline-photo"
              onClick={() => onPhotoClick(item.photo!, item.title)}
            >
              <img src={item.photo} alt={item.title} />
            </div>
          )}

          <div className="timeline-info">
            <h3 className="timeline-title">{item.title}</h3>
            <p className="timeline-date">{formatDate(item.date)}</p>
            <p className="timeline-description">{item.description}</p>
          </div>
        </div>
      </div>
      <div className="timeline-marker"></div>
    </div>
  );
};

export default TimelineItem;
