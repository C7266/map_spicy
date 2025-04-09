// src/components/search/RouteSelectionScreen.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
/** services import 경로 변경 */
import MapService from '../../services/MapService';
import RouteService from '../../services/RouteService';
import RouteInfoPanel from '../panels/RouteInfoPanel';
import './RouteSelectionScreen.css';

const RouteSelectionScreen = ({
  startLocation,
  destination,
  onBack,
  onNavigate,
  onStartLocationEdit,
  onDestinationEdit
}) => {
  const [routeType, setRouteType] = useState('normal');
  const [showCCTV, setShowCCTV] = useState(false);
  const [showStores, setShowStores] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const watchPositionId = useRef(null);

  // 경로 타입이 변경될 때 마커를 모두 숨김
  useEffect(() => {
    setShowCCTV(false);
    setShowStores(false);
  }, [routeType]);
  const [routeInfo, setRouteInfo] = useState(null);
  const mapRef = useRef(null);
  const mapServiceRef = useRef(null);
  const routeServiceRef = useRef(null);

  const toggleCCTV = (show) => {
    if (routeServiceRef.current) {
      routeServiceRef.current.toggleCCTVMarkers(show);
    }
    setShowCCTV(show);
  };

  const toggleStores = (show) => {
    if (routeServiceRef.current) {
      routeServiceRef.current.toggleStoreMarkers(show);
    }
    setShowStores(show);
  };

  const drawRoute = useCallback(async () => {
    if (!routeServiceRef.current || !startLocation || !destination) return;
    try {
      const result = await routeServiceRef.current.drawRoute(
        startLocation.coords,
        destination.coords,
        routeType
      );
      setRouteInfo(result);
    } catch (error) {
      console.error('경로 그리기 실패:', error);
      setRouteInfo({ error: '경로를 찾을 수 없습니다.' });
    }
  }, [startLocation, destination, routeType]);

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

  // 실시간 위치 추적 기능
  const startFollowing = useCallback(() => {
    if (!mapServiceRef.current) return;

    // 현재 위치로 지도 중심 이동 및 줌
    if (startLocation?.coords) {
      mapServiceRef.current.panTo(startLocation.coords);
      mapServiceRef.current.setZoomLevel(17); // 더 가까운 줌 레벨로 설정
    }

    // 위치 추적 시작
    watchPositionId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { latitude, longitude };
        
        // 현재 위치 마커 업데이트
        mapServiceRef.current.updateCurrentLocation(newCoords);
        
        // 따라가기 모드가 활성화된 경우에만 지도 중심 이동
        if (isFollowing) {
          mapServiceRef.current.panTo(newCoords);
        }
      },
      (error) => {
        console.error('위치 추적 오류:', error);
        setIsFollowing(false);
        alert('위치 추적에 실패했습니다. GPS 신호를 확인해주세요.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000, // 1초 이내의 캐시된 위치만 사용
        timeout: 5000
      }
    );
  }, [startLocation, isFollowing]);

  // 위치 추적 중지
  const stopFollowing = useCallback(() => {
    if (watchPositionId.current) {
      navigator.geolocation.clearWatch(watchPositionId.current);
      watchPositionId.current = null;
    }
  }, []);

  // 위치 추적 토글
  const handleFollowToggle = (follow) => {
    setIsFollowing(follow);
    if (follow) {
      startFollowing();
    } else {
      stopFollowing();
    }
  };

  // 컴포넌트 언마운트 시 위치 추적 중지
  useEffect(() => {
    return () => {
      if (watchPositionId.current) {
        navigator.geolocation.clearWatch(watchPositionId.current);
      }
    };
  }, []);

  useEffect(() => {
    drawRoute();
  }, [startLocation, destination, routeType, drawRoute]);

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
            <button className="back-button" onClick={onBack}>
              ✕
            </button>
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
          onClick={() => setRouteType('safe')} // 
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
          <RouteInfoPanel
            routeInfo={routeInfo}
            routeType={routeType}
            formatDistance={formatDistance}
            formatTime={formatTime}
            onCCTVToggle={toggleCCTV}
            onStoresToggle={toggleStores}
            showCCTV={showCCTV}
            showStores={showStores}
            onFollowToggle={handleFollowToggle}
            isFollowing={isFollowing}
          />

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
        </>
      )}
    </div>
  );
};

export default RouteSelectionScreen;