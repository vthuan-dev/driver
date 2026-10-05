import React from 'react';
import './AppTourGuide.css';

export const TourPhoneMockup: React.FC = () => (
  <div className="tour-phone-mockup">
    <div className="tour-phone-notch" />
    <div className="tour-phone-screen">
      <div className="tour-phone-circle">ĐC</div>
    </div>
  </div>
);

export const TourCurvedArrow: React.FC = () => (
  <svg
    className="tour-curved-arrow-svg"
    width="48"
    height="64"
    viewBox="0 0 52 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M 46 2 C 32 4, 16 16, 12 36 L 3 34 L 17 62 L 33 42 L 22 43 C 25 28, 36 18, 48 14 Z"
      fill="#ef4444"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

interface AppTourCardProps {
  title: string;
  description: React.ReactNode;
  buttonText: string;
  onNext: () => void;
  onClose: () => void;
}

export const AppTourCard: React.FC<AppTourCardProps> = ({
  title,
  description,
  buttonText,
  onNext,
  onClose,
}) => {
  return (
    <div className="tour-card" onClick={(e) => e.stopPropagation()}>
      <div className="tour-card-header">
        <TourPhoneMockup />
        <div className="tour-card-title">{title}</div>
        <button
          type="button"
          className="tour-card-close"
          aria-label="Đóng"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className="tour-card-desc">{description}</div>

      <div className="tour-card-footer">
        <button type="button" className="tour-btn-next" onClick={onNext}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default AppTourCard;
