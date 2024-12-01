import React from 'react';
import MapComponent from './MapComponent';
import SearchScreen from '../search/SearchScreen';
import './Map.css';

const Map = ({ selectedMode, isSearchOpen, setIsSearchOpen }) => {
  const filterButtons = {
    '일반': [
      { icon: '🏗️', text: '공사현장' },
      { icon: '🏪', text: '편의점' },
      { icon: '🚒', text: '소방시설' },
      { icon: '👮', text: '경찰서' },
      { icon: '⚠️', text: '범죄주의구간' },
    ],
    '여성': [
      { icon: '🚨', text: '안전비상벨' },
      { icon: '📹', text: 'CCTV' },
      { icon: '⚠️', text: '범죄주의구간' },
      { icon: '🏪', text: '편의점' },
      { icon: '🚒', text: '소방시설' },
      { icon: '👮', text: '경찰서' },
      { icon: '🏗️', text: '공사현장' },
    ],
    '노약자': [
      { icon: '🚇', text: '지하철역 엘레베이터' },
      { icon: '💊', text: '심야약국' },
      { icon: '🔌', text: '휠체어 충전소' },
      { icon: '🏥', text: '복지시설' },
      { icon: '⚠️', text: '범죄주의구간' },
      { icon: '🏪', text: '편의점' },
      { icon: '🚒', text: '소방시설' },
      { icon: '👮', text: '경찰서' },
      { icon: '🏗️', text: '공사현장' },
    ],
  };

  return (
    <div className="map-container">
      {isSearchOpen ? (
        <SearchScreen onClose={() => setIsSearchOpen(false)} />
      ) : (
        <>
          {/* 헤더 */}
          <div className="header">
            <div className="logo">
              <span className="logo-icon">🗺️</span>
              <span className="logo-text">map spicy</span>
            </div>
            <button className="menu-button">≡</button>
          </div>

          {/* 검색바 */}
          <div 
            className="search-bar"
            onClick={() => setIsSearchOpen(true)}
          >
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="장소, 주소 검색" 
              className="search-input" 
              readOnly
            />
            <span className="voice-icon">🎤</span>
          </div>
          
          {/* 필터 버튼 */}
          <div className="filter-buttons-container">
            <div className="filter-buttons-scroll">
              {filterButtons[selectedMode].map((button, index) => (
                <button key={index} className="filter-button">
                  <span className="filter-button-icon">{button.icon}</span>
                  <span className="filter-button-text">{button.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 지도 컴포넌트 */}
          <div className="map-component-container">
            <MapComponent />
          </div>
        </>
      )}
    </div>
  );
};

export default Map;