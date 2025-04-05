// src/components/panels/VisiblePanel.js
import React, { useState } from 'react';
import './VisiblePanel.css';

const VisiblePanel = ({ visibleItems = [], onToggle, items = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (key) => {
    onToggle(key);
  };

  return (
    <div className="visible-panel">
      <button
        className="visible-toggle-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <img
          src="/images/panel/visibility.png"
          alt="토글 보기"
          className="visibility-icon"
        />
      </button>

      {isOpen && (
        <div className="visible-button-list">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`visible-button ${visibleItems.includes(item.key) ? 'active' : ''}`}
              onClick={() => handleToggle(item.key)}
            >
              <div className="icon-circle">
                <img
                  src={item.icon}
                  alt={item.key}
                  className="visible-icon"
                />
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VisiblePanel;
