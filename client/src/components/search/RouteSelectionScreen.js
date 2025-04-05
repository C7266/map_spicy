// src/components/search/RouteSelectionScreen.js
import React, { useState, useEffect, useRef, useCallback, lazy } from 'react';
/** services import 경로 변경 */
import MapService from '../../services/MapService';
import RouteService from '../../services/RouteService';
import RouteInfoPanel from '../panels/RouteInfoPanel';
import VisiblePanel from '../panels/VisiblePanel';
import './RouteSelectionScreen.css';

const RouteSelectionScreen = ({
  startLocation,
  destination,
  onBack,
  onNavigate,
  onStartLocationEdit,
  onDestinationEdit,
  selectedMode // VisiblePanel 아이콘 동적 변경을 위해 추가.
}) => {
  const [routeType, setRouteType] = useState('normal');
  const [routeInfo, setRouteInfo] = useState(null);
  const mapRef = useRef(null);
  const mapServiceRef = useRef(null);
  const routeServiceRef = useRef(null);
  
  // VisiblePanel 리스트 동적 변경.
  const filterButtons = {
    '일반': [
      { key: 'gong4', label: '공사현장', icon: '/images/icon/normal/gong4.png' },
      { key: 'store', label: '편의점', icon: '/images/icon/normal/store.png' },
      { key: 'oneonenine', label: '소방시설', icon: '/images/icon/normal/oneonenine.png' },
      { key: 'police', label: '경찰서', icon: '/images/icon/normal/police.png' },
      { key: 'warning', label: '범죄주의구간', icon: '/images/icon/normal/warning.png' },
    ],
    '여성': [
      { key: 'siren', label: '안전비상벨', icon: '/images/icon/women/siren.png' },
      { key: 'cctv', label: 'CCTV', icon: '/images/icon/women/cctv.png' },
      { key: 'warning', label: '범죄주의구간', icon: '/images/icon/women/warning.png' },
      { key: 'store', label: '편의점', icon: '/images/icon/women/store.png' },
      { key: 'oneonenine', label: '소방시설', icon: '/images/icon/women/oneonenine.png' },
      { key: 'police', label: '경찰서', icon: '/images/icon/women/police.png' },
      { key: 'gong4', label: '공사현장', icon: '/images/icon/women/gong4.png' },
    ],
    '노약자': [
      { key: 'ele', label: '지하철 엘리베이터', icon: '/images/icon/old/ele.svg' },
      { key: 'drugstore', label: '심야약국', icon: '/images/icon/old/drugstore.svg' },
      { key: 'charge', label: '휠체어 충전소', icon: '/images/icon/old/charge.png' },
      { key: 'noin', label: '복지시설', icon: '/images/icon/old/noin.png' },
      { key: 'warning', label: '범죄주의구간', icon: '/images/icon/old/warning.png' },
      { key: 'store', label: '편의점', icon: '/images/icon/old/store.png' },
      { key: 'oneonenine', label: '소방시설', icon: '/images/icon/old/oneonenine.png' },
      { key: 'police', label: '경찰서', icon: '/images/icon/old/police.png' },
      { key: 'gong4', label: '공사현장', icon: '/images/icon/old/gong4.png' },
    ],
  };

  const [visibleItems, setVisibleItems] = useState([]); // 아무것도 안 보이게 시작
  
  const handleToggleVisible = (key) => {
    setVisibleItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const drawRoute = useCallback(async () => {
    if (!routeServiceRef.current || !startLocation || !destination) return;
    try {
      const result = await routeServiceRef.current.drawRoute(
        startLocation.coords,
        destination.coords,
        routeType,
        visibleItems
      );
      setRouteInfo(result);
    } catch (error) {
      console.error('경로 그리기 실패:', error);
      setRouteInfo({ error: '경로를 찾을 수 없습니다.' });
    }
  }, [startLocation, destination, routeType, visibleItems]);

  useEffect(() => {
    if (mapRef.current) {
      const initialCoords = startLocation?.coords || {
        latitude: 37.5665, // 서울시청 좌표(기본값)
        longitude: 126.9780
      };
      mapServiceRef.current = new MapService(mapRef.current, initialCoords);
      routeServiceRef.current = new RouteService(
        mapServiceRef.current.getMapInstance()
      );

      if (startLocation) {
        mapServiceRef.current.setCurrentLocation(startLocation.coords);
      }
    }
    // ESLint 경고 해결: mapRef는 ref이므로 의존성 배열에 포함시키지 않음
  }, [startLocation]);

  useEffect(() => {
    drawRoute();
  }, [startLocation, destination, routeType, visibleItems, drawRoute]);

  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}시간 ${remainingMinutes}분`;
  };

  return (
    <div className="route-selection-screen">
      <div className="route-header">
        <div className="header-top">
          <button className="back-button" onClick={onBack}>
            ✕
          </button>
        </div>
        <div className="location-inputs">
          <div className="input-row clickable" onClick={onStartLocationEdit}>
            <span className="location-icon">⬆️</span>
            <input
              type="text"
              placeholder="출발지를 설정하세요"
              className="location-input"
              value={startLocation ? startLocation.name : ''}
              readOnly
            />
          </div>
          <div className="input-row clickable" onClick={onDestinationEdit}>
            <span className="location-icon">⬇️</span>
            <input
              type="text"
              value={destination ? destination.name : ''}
              className="location-input"
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="transport-tabs">
        <button
          className={`transport-tab ${routeType === 'normal' ? 'active' : ''}`}
          onClick={() => setRouteType('normal')}
        >
          <img
            src="/images/RouteSelectionScreen/normal.svg"
            alt="일반 경로"
            className="tab-icon"
          />
          <span className="tab-text">일반</span>
        </button>
        <button
          className={`transport-tab ${routeType === 'safe' ? 'active' : ''}`}
          onClick={() => setRouteType('safe')}
        >
          <img
            src="/images/RouteSelectionScreen/safe.svg"
            alt="안전 경로"
            className="tab-icon"
          />
          <span className="tab-text">안전</span>
        </button>
      </div>

      {startLocation && destination && (
        <>
          <div className="map-container" ref={mapRef}></div>
          
          
          <button // 유저의 현재 위치로 화면 이동. 아직 기능은 구현 X
            className="move-to-current-button"
            onClick={() => {
              if (mapServiceRef.current) {
                mapServiceRef.current.moveToCurrentLocation();
              }
            }}
          >
            <img src="/images/RouteSelectionScreen/location.svg " alt="현재 위치로 이동" />
          </button>

          <RouteInfoPanel
            routeInfo={routeInfo}
            routeType={routeType}
            formatDistance={formatDistance}
            formatTime={formatTime}
          />
          
          {routeType === 'safe' && (
            <VisiblePanel
              visibleItems={visibleItems}
              onToggle={handleToggleVisible}
              items={filterButtons[selectedMode]} // 유저가 선택한 모드의 아이콘 전달.
            />
          )}
        </>
      )}

    </div>
  );
};

export default RouteSelectionScreen;