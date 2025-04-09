// src/pages/SuggestPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SuggestPage.css'; // 별도 CSS 파일 생성 필요

const SuggestPage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    description: '',
    photos: [],
    contact: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // 실제로는 API 호출 구현 필요
    console.log('제출 데이터:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => URL.createObjectURL(file));
    setFormData({ ...formData, photos: [...formData.photos, ...previews] });
  };

  return (
    <div className="suggest-container">
      {/* ✅ 뒤로가기 버튼 추가 */}
      <button className="back-button-suggest" onClick={() => navigate(-1)}>
        ←
      </button>

      <div className="suggest-header">
        <h1>시설물 파손 건의</h1>
        <p>발견하신 시설물 문제를 신속하게 해결할 수 있도록 도와주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="suggest-form">
        {/* 제목 입력 */}
        <div className="form-section">
          <label>제목 (필수)</label>
          <input
            type="text"
            placeholder="예) ○○아파트 1동 엘리베이터 파손"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        {/* 유형 선택 */}
        <div className="form-section">
          <label>유형 선택 (필수)</label>
          <div className="category-grid">
            {['엘리베이터', '계단', '도로', '조명', '난간', '기타'].map((cat) => (
              <button
                type="button"
                key={cat}
                className={`category-btn ${formData.category === cat ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, category: cat })}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 위치 입력 */}
        <div className="form-section">
          <label>위치 정보 (선택)</label>
          <div className="location-input">
            <input
              type="text"
              placeholder="주소 또는 건물명 검색"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <button type="button" className="map-btn">
              🗺️ 지도에서 위치 지정
            </button>
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="form-section">
          <label>상세 설명 (필수)</label>
          <textarea
            placeholder="파손 정도, 발생 시간대, 위험성 등 자세히 설명해주세요"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="5"
            required
          />
        </div>

        {/* 사진 업로드 */}
        <div className="form-section">
          <label>사진 첨부 (최대 5장)</label>
          <div className="photo-upload">
            <label className="upload-btn">
              📸 사진 추가
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
            <div className="photo-preview">
              {formData.photos.map((preview, index) => (
                <img key={index} src={preview} alt={`미리보기-${index}`} />
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn">
          건의 제출하기
        </button>

        {submitted && (
          <div className="success-message">
            ✅ 건의사항이 성공적으로 제출되었습니다
          </div>
        )}
      </form>
    </div>
  );
};

export default SuggestPage;