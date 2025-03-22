// src/components/panels/UserSettingsPanel.js
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './UserSettingsPanel.css';

const UserSettingsPanel = ({ onModeChange, selectedMode = '일반' }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelRef = useRef(null);

  // 패널 클릭 시 토글
  const handlePanelClick = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  // 터치 이벤트 처리
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const startY = touch.clientY;

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = startY - currentY;

      if (deltaY > 50) { // 위로 스와이프
        setIsPanelOpen(true);
      } else if (deltaY < -50) { // 아래로 스와이프
        setIsPanelOpen(false);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div 
      className={`settings-panel ${isPanelOpen ? 'open' : ''}`}
      ref={panelRef}
      onClick={handlePanelClick}
      onTouchStart={handleTouchStart}
    >
      <div className="panel-header">
        <div className="drag-handle" />
        <span className="panel-title">사용자 맞춤 설정</span>
      </div>
      <div className="panel-content">
        <div className="settings-section">
          <div className="user-type-buttons">
            <button 
              type="button"
              className={`user-type-button ${selectedMode === '일반' ? 'active' : ''}`}
              onClick={() => onModeChange('일반')}
            >
              <div className="icon-circle">
                <img 
                  src="/images/panel/human-male-blue.svg" // 색 변경
                  alt="일반"
                  className="mode-icon"
                />
              </div>
              <span>일반</span>
            </button>
            <button 
              type="button"
              className={`user-type-button ${selectedMode === '여성' ? 'active' : ''}`}
              onClick={() => onModeChange('여성')}
            >
              <div className="icon-circle">
                <img 
                  src="/images/panel/human-female-blue.svg" // 색 변경
                  alt="여성"
                  className="mode-icon"
                />
              </div>
              <span>여성</span>
            </button>
            <button 
              type="button"
              className={`user-type-button ${selectedMode === '노약자' ? 'active' : ''}`}
              onClick={() => onModeChange('노약자')}
            >
              <div className="icon-circle">
                <img 
                  src="/images/panel/human-wheelchair-blue.svg" // 색 변경
                  alt="노약자"
                  className="mode-icon"
                />
              </div>
              <span>노약자</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


UserSettingsPanel.propTypes = {
  onModeChange: PropTypes.func.isRequired,
  selectedMode: PropTypes.string
};

export default UserSettingsPanel;
