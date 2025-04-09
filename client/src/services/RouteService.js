/* global naver */
class RouteService {
  constructor(mapInstance) {
    this.mapInstance = mapInstance;
    this.markers = [];
    this.cctvMarkers = [];
    this.pathInstance = null;
    this.pathBorderInstance = null;
    this.storeMarkers = [];
    this.currentInfoWindow = null;
    this.startMarker = null;
    this.endMarker = null;
  }

  clearMap() {
    if (this.pathInstance) {
      this.pathInstance.setMap(null);
    }
    if (this.pathBorderInstance) {
      this.pathBorderInstance.setMap(null);
    }
    this.markers.forEach(marker => marker.setMap(null));
    this.cctvMarkers.forEach(marker => marker.setMap(null));
    this.storeMarkers.forEach(marker => marker.setMap(null));
    
    this.markers = [];
    this.cctvMarkers = [];
    this.storeMarkers = [];
    
    if (this.currentInfoWindow) {
      this.currentInfoWindow.close();
    }
    this.startMarker = null;
    this.endMarker = null;
  }
// cctv랑 편의점 토글
  toggleCCTVMarkers(show) {
    this.cctvMarkers.forEach(marker => {
      marker.setMap(show ? this.mapInstance : null);
    });
  }

  toggleStoreMarkers(show) {
    this.storeMarkers.forEach(marker => {
      marker.setMap(show ? this.mapInstance : null);
    });
  }
// 출발 도착 마커 사이즈 줄임
  calculateMarkerSize = () => {
    const zoom = this.mapInstance.getZoom();
    const baseSize = 28;
    const scale = Math.max(0.5, Math.min(2, zoom / 12));
    return Math.round(baseSize * scale);
  };

  updateMarkers = () => {
    const newSize = this.calculateMarkerSize();
    const newHalf = newSize / 2;

    if (this.startMarker) {
      this.startMarker.setIcon({
        url: 'images/map/start.svg',
        size: new naver.maps.Size(newSize, newSize),
        scaledSize: new naver.maps.Size(newSize, newSize),
        origin: new naver.maps.Point(0, 0),
        anchor: new naver.maps.Point(newHalf, newHalf)
      });
    }

    if (this.endMarker) {
      this.endMarker.setIcon({
        url: 'images/map/goal.svg',
        size: new naver.maps.Size(newSize, newSize),
        scaledSize: new naver.maps.Size(newSize, newSize),
        origin: new naver.maps.Point(0, 0),
        anchor: new naver.maps.Point(newHalf, newHalf)
      });
    }
  }

  async drawRoute(startCoords, goalCoords, routeType) {
    try {
      this.clearMap();

      const initialSize = this.calculateMarkerSize();
      const initialHalf = initialSize / 2;

      this.startMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(startCoords.latitude, startCoords.longitude),
        map: this.mapInstance,
        icon: {
          url: 'images/map/start.svg',
          size: new naver.maps.Size(initialSize, initialSize),
          scaledSize: new naver.maps.Size(initialSize, initialSize),
          origin: new naver.maps.Point(0, 0),
          anchor: new naver.maps.Point(initialHalf, initialHalf)
        },
        zIndex: 50
      });

      this.endMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(goalCoords.latitude, goalCoords.longitude),
        map: this.mapInstance,
        icon: {
          url: 'images/map/goal.svg',
          size: new naver.maps.Size(initialSize, initialSize),
          scaledSize: new naver.maps.Size(initialSize, initialSize),
          origin: new naver.maps.Point(0, 0),
          anchor: new naver.maps.Point(initialHalf, initialHalf)
        },
        zIndex: 50
      });

      naver.maps.Event.addListener(this.mapInstance, 'zoom_changed', this.updateMarkers);

      this.markers.push(this.startMarker, this.endMarker);

      const apiEndpoint = routeType === 'safe' ? 'safe-direction' : 'normal-direction';
      const startStr = `${startCoords.latitude},${startCoords.longitude}`;
      const goalStr = `${goalCoords.latitude},${goalCoords.longitude}`;
      
      console.log('요청 좌표:', { start: startStr, goal: goalStr });

      const response = await fetch(
        `http://localhost:3001/direction/${apiEndpoint}?start=${startStr}&goal=${goalStr}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '경로 검색 실패');
      }

      const result = await response.json();
      console.log('서버 응답:', result);

      if (result.success && result.data.features) {
        const pathCoordinates = [];
        
        result.data.features.forEach(feature => {
          if (feature.geometry.type === 'LineString') {
            pathCoordinates.push(...feature.geometry.coordinates);
          }
        });

        const path = pathCoordinates.map(coord => new naver.maps.LatLng(coord[1], coord[0]));

        // 경로에 테두리 주기
        this.pathBorderInstance = new naver.maps.Polyline({
          map: this.mapInstance,
          path: path,
          strokeColor: '#000000',
          strokeWeight: 5,
          strokeOpacity: 1,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          zIndex: 1
        });

        // 메인 경로 그리기
        this.pathInstance = new naver.maps.Polyline({
          map: this.mapInstance,
          path: path,
          strokeColor: '#597BEB',
          strokeWeight: 3,
          strokeOpacity: 1,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          zIndex: 2
        });

        const bounds = new naver.maps.LatLngBounds();
        pathCoordinates.forEach(coord => {
          bounds.extend(new naver.maps.LatLng(coord[1], coord[0]));
        });
        
        this.mapInstance.fitBounds(bounds);

        // 안전 경로일 때 마커 데이터 저장
        if (routeType === 'safe') {
          if (result.data.nearbyCCTVs && result.data.nearbyCCTVs.length > 0) {
            this.displayCCTVMarkers(result.data.nearbyCCTVs);
            // 처음에는 마커 안보이게 함
            this.toggleCCTVMarkers(false);
          }
          if (result.data.nearbyStores && result.data.nearbyStores.length > 0) {
            this.displayStoreMarkers(result.data.nearbyStores);
            // 처음에는 마커 안 보이게 함
            this.toggleStoreMarkers(false);
          }
        }

        return {
          distance: result.data.features[0].properties.totalDistance || 0,
          time: result.data.features[0].properties.totalTime || 0,
          safety: result.data.safety,
          cctvCount: result.data.nearbyCCTVs?.length || 0,
          storeCount: result.data.nearbyStores?.length || 0
        };
      }
    } catch (error) {
      console.error('경로 그리기 실패:', error);
      throw error;
    }
  }
// 절반 으로 줄임
  displayCCTVMarkers(cctvData) {
    cctvData.forEach(cctv => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(cctv.latitude, cctv.longitude),
        map: this.mapInstance,
        icon: { 
          url: '/images/map/direction/CCTV.svg',
          size: new naver.maps.Size(24, 24), 
          scaledSize: new naver.maps.Size(24, 24), 
          origin: new naver.maps.Point(0, 0),
          anchor: new naver.maps.Point(12, 12)
        },
        zIndex: 30
      });

      const infoWindow = new naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h4 style="margin: 0 0 5px 0;">CCTV 정보</h4>
            <p style="margin: 5px 0;">카메라 수: ${cctv.cameraCount || 1}대</p>
            <p style="margin: 5px 0;">설치 목적: ${cctv.purpose || '안전 감시'}</p>
            <p style="margin: 5px 0; font-size: 12px;">${cctv.address || '주소 정보 없음'}</p>
          </div>
        `,
        borderWidth: 0,
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
      });

      let isInfoWindowOpen = false;
      
      naver.maps.Event.addListener(marker, 'click', () => {
        if (isInfoWindowOpen) {
          infoWindow.close();
          isInfoWindowOpen = false;
        } else {
          if (this.currentInfoWindow) {
            this.currentInfoWindow.close();
          }
          infoWindow.open(this.mapInstance, marker);
          this.currentInfoWindow = infoWindow;
          isInfoWindowOpen = true;
        }
      });

      this.cctvMarkers.push(marker);
    });
  }
// 크기 절반으로 줄임
  displayStoreMarkers(stores) {
    stores.forEach(store => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(store.latitude, store.longitude),
        map: this.mapInstance,
        icon: {
          url: '/images/map/direction/store.svg',
          size: new naver.maps.Size(24, 24),
          scaledSize: new naver.maps.Size(24, 24),
          origin: new naver.maps.Point(0, 0),
          anchor: new naver.maps.Point(12, 12)
        },
        zIndex: 30
      });

      const infoWindow = new naver.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h4 style="margin: 0 0 5px 0;">${store.name || '편의점'}</h4>
            <p style="margin: 5px 0;">${store.address || '주소 정보 없'}</p>
            <p style="margin: 5px 0; color: #666;">거리: ${store.distance || '정보 없음'}</p>
          </div>
        `,
        borderWidth: 0,
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
      });

      let isInfoWindowOpen = false;

      naver.maps.Event.addListener(marker, 'click', () => {
        if (isInfoWindowOpen) {
          infoWindow.close();
          isInfoWindowOpen = false;
        } else {
          if (this.currentInfoWindow) {
            this.currentInfoWindow.close();
          }
          infoWindow.open(this.mapInstance, marker);
          this.currentInfoWindow = infoWindow;
          isInfoWindowOpen = true;
        }
      });

      this.storeMarkers.push(marker);
    });
  }
}

export default RouteService;