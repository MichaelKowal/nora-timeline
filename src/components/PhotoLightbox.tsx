import React from "react";
import "./PhotoLightbox.css";

interface PhotoLightboxProps {
  photo: string;
  title: string;
  onClose: () => void;
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  title,
  onClose,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="photo-lightbox-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label="Full size photo"
    >
      <div className="photo-lightbox-container">
        <button
          className="photo-lightbox-close"
          onClick={onClose}
          aria-label="Close photo viewer"
        >
          ×
        </button>

        <div className="photo-lightbox-content">
          <img src={photo} alt={title} className="photo-lightbox-image" />
          <div className="photo-lightbox-title">{title}</div>
        </div>
      </div>
    </div>
  );
};

export default PhotoLightbox;
