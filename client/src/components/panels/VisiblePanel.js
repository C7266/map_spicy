// src/components/panels/VisiblePanel.js
import React, { useState } from 'react';
import './VisiblePanel.css';

const VisiblePanel = ({ visibleItems = [], onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 후에 다른 유저 세팅에 맞춰서 변경하는 기능도 추가.
  const items = [
    { key: 'cctv', label: 'CCTV', icon: '/images/icon/women/cctv.png' },
    { key: 'store', label: '편의점', icon: '/images/icon/women/store.png' },
  ];

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
                  alt={item.label}
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
