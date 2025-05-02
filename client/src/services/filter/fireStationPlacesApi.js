export const fetchFireStationPlacesData = async (lat, lng) => {
    try {
      // 위치 정보를 쿼리 파라미터로 추가
      const params = new URLSearchParams({
        lat: lat,
        lng: lng
      });

      const PROXY_URL = 'http://15.164.94.96:3001';

      const response = await fetch(`${PROXY_URL}/api/fireStationPlaces?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch fire station places: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error in fetchFireStationPlacesData:", error);
      return [];
    }
  };
  