"use client";
import React from 'react';

interface JourneyInfoProps {
  distance?: string;
  address?: string[];
  time?: string;
}

const JourneyInfo: React.FC<JourneyInfoProps> = ({ 
  distance = "0 km", 
  address = [], 
  time = "" 
}) => {
  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '1.25rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    width: '100%',
    maxWidth: '275px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '0.75rem 0',
    borderBottom: '1px solid #E5E7EB',
  };

  const rowFirstStyle: React.CSSProperties = {
    ...rowStyle,
    paddingTop: '0',
  };

  const rowLastStyle: React.CSSProperties = {
    ...rowStyle,
    borderBottom: 'none',
    paddingBottom: '0',
  };

  const rowAddressStyle: React.CSSProperties = {
    ...rowLastStyle,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.5rem',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#10B981',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#1F2937',
    textAlign: 'right',
  };

  const addressContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    marginTop: '0.25rem',
  };

  const addressLineStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#4B5563',
    lineHeight: '1.4',
    paddingLeft: '0.75rem',
    borderLeft: '3px solid #10B981',
  };

  return (
    <div 
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Distance */}
      {distance && (
        <div style={rowFirstStyle}>
          <span style={labelStyle}>Distance</span>
          <span style={valueStyle}>{distance}</span>
        </div>
      )}

      {/* Time */}
      {time && (
        <div style={rowStyle}>
          <span style={labelStyle}>Time</span>
          <span style={valueStyle}>{time}</span>
        </div>
      )}

      {/* Address */}
      {address && address.length > 0 && (
        <div style={rowAddressStyle}>
          <span style={labelStyle}>Address</span>
          <div style={addressContentStyle}>
            {address.slice(0, 3).map((addr, index) => (
              <span key={index} style={addressLineStyle}>
                {addr}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyInfo;

