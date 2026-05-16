import React from 'react';

const GlassCard = ({ children, className = "" }) => (
  <div className={`glass-card p-6 md:p-8 ${className}`}>
    {children}
  </div>
);

export default GlassCard;
