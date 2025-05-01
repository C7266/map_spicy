require('dotenv').config();
const express = require('express');
const router = express.Router();
const cctvService = require('../../services/cctvService');

// 두 지점 간의 거리를 계산하는 함수 (Haversine 공식)
function calculateDistance(lat1, lon1, lat2, lon2) {
  try {
    const R = 6371; // 지구의 반경 (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  } catch (err) {
    console.error('거리 계산 오류:', err);
    return Infinity;
  }
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// 거리를 포맷팅하는 함수 추가
function formatDistance(distance) {
  // 거리가 1km 이상이면 소수점 첫째 자리까지 km로 표시
  if (distance >= 1) {
    return `${distance.toFixed(1)}km`;
  }
  // 1km 미만이면 m 단위로 변환하여 표시
  return `${Math.round(distance * 1000)}m`;
}

router.get('/', async (req, res) => {
  try {
    console.log('CCTV 데이터 요청 수신...');
    // 클라이언트에서 전달된 위치 정보 추출
    const { lat, lng } = req.query;
    console.log(`클라이언트 요청 위치: lat=${lat}, lng=${lng}`);

    // CCTV 전체 데이터 가져오기
    const fullData = await cctvService.getCCTVData();
    console.log(`CCTV 데이터 ${fullData ? fullData.length : 0}개 가져옴`);

    // 좌표 데이터만 추출 (유효한 좌표값만 남김)
    const locationData = fullData
      .filter(item =>
        item &&
        typeof item.latitude === 'number' && !isNaN(item.latitude) &&
        typeof item.longitude === 'number' && !isNaN(item.longitude)
      )
      .map(item => ({
        latitude: item.latitude,
        longitude: item.longitude,
        name: `CCTV (${item.cameraCount || 1}대)`,
        address: item.address || '주소 정보 없음',
        purpose: item.purpose || '일반 방범용'
      }));

    console.log(`유효한 좌표 데이터 ${locationData.length}개 추출됨`);

    // 클라이언트가 위치 정보를 전달했다면 해당 위치에서 5km 반경 내 데이터만 필터링
    if (lat && lng) {
      const clientLat = parseFloat(lat);
      const clientLng = parseFloat(lng);
      if (isNaN(clientLat) || isNaN(clientLng)) {
        console.log('유효하지 않은 좌표값. 전체 데이터 반환.');
        return res.json(locationData);
      }
      const radius = 1; // 1km 반경
      const nearbyLocations = locationData.filter(item => {
        const distance = calculateDistance(clientLat, clientLng, item.latitude, item.longitude);
        // 거리 정보 추가
        if (distance <= radius) {
          item.distance = formatDistance(distance);
          return true;
        }
        return false;
      });
      
      // 거리별로 정렬
      nearbyLocations.sort((a, b) => {
        const distA = calculateDistance(clientLat, clientLng, a.latitude, a.longitude);
        const distB = calculateDistance(clientLat, clientLng, b.latitude, b.longitude);
        return distA - distB;
      });
      
      console.log(`${locationData.length}개의 CCTV 중 ${nearbyLocations.length}개가 ${radius}km 반경 내에 있습니다.`);
      return res.json(nearbyLocations);
    } else {
      console.log(`클라이언트 위치 정보가 없어 전체 ${locationData.length}개의 좌표 데이터를 반환합니다.`);
      return res.json(locationData);
    }
  } catch (error) {
    console.error('CCTV API 요청 실패:', error);
    console.error('오류 스택:', error.stack);
    // 오류 발생 시 빈 배열 반환하여 클라이언트에 전달
    return res.json([]);
  }
});

module.exports = router;
