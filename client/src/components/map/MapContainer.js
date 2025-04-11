// src/components/map/MapContainer.js
import React, { useState } from 'react';
import NaverMap from './NaverMap';
import MenuPanel from '../panels/MenuPanel'; // Menu기능 추가
import './MapContainer.css';

// filterButtons 정의
const filterButtons = {
  '일반': [
    { icon: '/images/icon/normal/store.png', text: '편의점' },
    { icon: '/images/icon/normal/oneonenine.png', text: '소방시설' },
    { icon: '/images/icon/normal/police.png', text: '경찰서' },
  ],
  '여성': [
    { icon: '/images/icon/women/siren.png', text: '안전비상벨' },
    { icon: '/images/icon/women/cctv.png', text: 'CCTV' },
    { icon: '/images/icon/women/store.png', text: '편의점' },
    { icon: '/images/icon/women/oneonenine.png', text: '소방시설' },
    { icon: '/images/icon/women/police.png', text: '경찰서' },
  ],
  '노약자': [
    { icon: '/images/icon/old/ele.png', text: '지하철역 엘레베이터' },
    { icon: '/images/icon/old/drugstore.png', text: '심야약국' },
    { icon: '/images/icon/old/charge.png', text: '휠체어 충전소' },
    { icon: '/images/icon/old/noin.png', text: '복지시설' },
    { icon: '/images/icon/old/store.png', text: '편의점' },
    { icon: '/images/icon/old/oneonenine.png', text: '소방시설' },
    { icon: '/images/icon/old/police.png', text: '경찰서' },
  ],
};

const MapContainer = ({ 
  selectedMode, 
  isSearchOpen, 
  setIsSearchOpen, 
  onNavigate,
  onEditStart,
  onEditDestination,
  onCurrentLocationUpdate,
  startLocation
}) => {
  const [activeFilters, setActiveFilters] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 메뉴 열림 기능 추가

  const toggleMenu = () => setIsMenuOpen(prev => !prev); // 

  const handleFilterClick = (filterText) => {
    console.log('Filter clicked:', filterText);
    setActiveFilters(prev => {
      const newFilters = prev.includes(filterText)
        ? prev.filter(f => f !== filterText)
        : [...prev, filterText];
      return newFilters;
    });
  };

  return (
    <div className="map-container" style={{ overflow: 'hidden' }}>
      {/* 상단바, 검색바, 필터 버튼 등 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        width: '100%',
        touchAction: 'pan-x',
        height: '170px',
        background: 'transparent',
        pointerEvents: 'auto'
      }}>

        {/* 검색바 */}
        <div className="search-bar" style={{
          width: '90%',
          maxWidth: 'calc(100% - 32px)',  // 양쪽 여백 16px씩
          margin: '0 auto'  // 중앙 정렬
        }}>
          
          {/* ≡ 메뉴 버튼으로 변경 */}
          <button 
            className="menu-button"
            style={{
              cursor: 'pointer'
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleMenu(); // 메뉴 열고 닫기
            }}
          >
            ≡
          </button>


          {/* 검색 입력창 */}
          <div 
            onClick={() => onEditDestination()} // 도착지 검색 열기
            style={{
              flex: 1,
              cursor: 'pointer',
              height: '70%',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <input 
              type="text" 
              placeholder="장소, 버스, 지하철, 주소 검색" 
              className="search-input" 
              readOnly
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                height: '100%'
              }}
            />
          </div>
        </div>
        
        {/* 필터 버튼 */}
        <div className="filter-buttons-container">
          <div className="filter-buttons-scroll">
            {filterButtons[selectedMode].map((button, index) => (
              <button 
                key={index} 
                className={`filter-button ${activeFilters.includes(button.text) ? 'active' : ''}`}
                onClick={() => handleFilterClick(button.text)}
              >
                <img 
                  src={button.icon} 
                  alt={button.text}
                  className="filter-button-icon"
                  style={{
                    width: '20px',
                    height: '20px',
                    objectFit: 'contain'
                  }}
                />
                <span className="filter-button-text">{button.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 실제 지도 렌더 */}
      <div className="map-component-container">
        <NaverMap
          selectedMode={selectedMode}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          onFilterClick={handleFilterClick}
          onCurrentLocationUpdate={onCurrentLocationUpdate}
          startLocation={startLocation}
        />
      </div>

      {/* 메뉴 패널 삽입 */}
      <MenuPanel isOpen={isMenuOpen} onClose={toggleMenu} />

    </div>
  );
};

export default MapContainer;