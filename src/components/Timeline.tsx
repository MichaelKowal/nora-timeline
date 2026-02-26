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

  const sortedItems = [...items].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const handlePhotoClick = (photo: string, title: string) => {
    setLightboxPhoto({ photo, title });
  };

  const closeLightbox = () => {
    setLightboxPhoto(null);
  };

  return (
    <div className="timeline-container">
      <h2 className="timeline-title">{babyName}'s Journey</h2>
      <div className="timeline">
        {sortedItems.length === 0 ? (
          <div className="timeline-empty">
            <p>
              No milestones added yet. Start documenting {babyName}'s journey!
            </p>
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
