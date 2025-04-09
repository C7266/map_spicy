// src/components/panels/MenuPanel.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // 추가
import './MenuPanel.css';

const MenuPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate(); // 추가

  return (
    <div className={`menu-panel ${isOpen ? 'open' : ''}`}>
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <div className="menu-content">
        <h3>메뉴</h3>
        <ul>
          <li>서비스 소개</li>
          <li onClick={() => navigate('/suggest')}>건의함</li> {/* 수정 */}
          <li>설명문</li>
          <li>고객센터</li>
        </ul>
      </div>
    </div>
  );
};

export default MenuPanel;