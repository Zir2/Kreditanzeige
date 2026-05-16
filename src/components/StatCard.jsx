import React from 'react';

const StatCard = ({ label, value, subtext, icon, trend, progress }) => (
  <div className="glass-card p-6 relative overflow-hidden">
    <p className="text-on-surface-variant text-sm font-medium mb-1">{label}</p>
    <h3 className="font-display text-2xl font-bold">{value}</h3>
    
    {progress !== undefined && (
      <div className="mt-4 w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-1000" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    )}

    {trend && (
      <div className={`mt-4 flex items-center gap-2 text-xs font-bold ${trend.positive ? 'text-success' : 'text-error'}`}>
        <span className="material-symbols-outlined text-sm">{trend.icon}</span>
        <span>{trend.text}</span>
      </div>
    )}

    {subtext && <p className="mt-4 text-on-surface-variant text-xs">{subtext}</p>}
  </div>
);

export default StatCard;
