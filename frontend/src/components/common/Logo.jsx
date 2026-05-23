// src/components/common/Logo.jsx
import React from 'react';

const Logo = ({ size = 32, showText = true, light = false, style = {} }) => {
  const gradientId = `logo-gradient-${light ? 'light' : 'dark'}`;
  
  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: size * 0.25, 
      userSelect: 'none',
      ...style 
    }}>
      <div style={{ 
        position: 'relative',
        width: size, 
        height: size,
        transition: 'transform 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) rotate(-3deg)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
      >
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
          {/* Stylized 'T' representing tools and bridge/connection */}
          <path 
            d="M9 11C9 9.89543 9.89543 9 11 9H21C22.1046 9 23 9.89543 23 11C23 12.1046 22.1046 13 21 13H17V21C17 22.1046 16.1046 23 15 23H15C13.8954 23 13 22.1046 13 21V13H11C9.89543 13 9 12.1046 9 11Z" 
            fill="white" 
          />
          {/* A small dot to represent a joint or a person (community) */}
          <circle cx="22" cy="22" r="3" fill="white" fillOpacity="0.9" />
          <path d="M22 20.5V23.5M20.5 22H23.5" stroke="#2563eb" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
      </div>
      
      {showText && (
        <span style={{ 
          fontWeight: 850, 
          fontSize: size * 0.45, 
          color: light ? '#fff' : '#0f172a', 
          letterSpacing: '-0.7px',
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          transition: 'all 0.2s ease',
          background: light ? 'none' : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
          WebkitBackgroundClip: light ? 'none' : 'text',
          WebkitTextFillColor: light ? 'inherit' : 'transparent',
          ...style.textStyle
        }}>
          Tasharuk
        </span>
      )}
    </div>
  );
};

export default Logo;
