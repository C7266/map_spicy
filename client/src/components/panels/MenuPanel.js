// src/components/panels/MenuPanel.js
import React from 'react';
import './MenuPanel.css';

const MenuPanel = ({ isOpen, onClose }) => {
  return (
    <div className={`menu-panel ${isOpen ? 'open' : ''}`}>
      <button className="close-button" onClick={onClose}>
        ×
      </button>
      <div className="menu-content">
        <h3>메뉴</h3>
        <ul>
          <li>서비스 소개</li>
          <li>건의함</li>
          <li>설명문</li>
          <li>고객센터</li>
        </ul>
      </div>
    </div>
  );
};

export default MenuPanel;
