"use client";
import React from 'react';

interface CustomSpeedometerProps {
  value: number;
  max?: number;
  unit?: string;
}

const CustomSpeedometer: React.FC<CustomSpeedometerProps> = ({ 
  value, 
  max = 150,
  unit = "km/h" 
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;

  // Create circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      
      {/* ============================================ */}
      {/* FIRST DESIGN - Circular Speedometer Design */}
      {/* ============================================ */}
      {/* <div className="w-full bg-white rounded-xl p-4 shadow-lg">
        
        <div className="text-center mb-2">
          <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider">Speed</h3>
        </div>

        <div className="relative flex items-center justify-center">
          <svg width="120" height="140" className="transform -rotate-90">
            <circle
              cx="60"
              cy="70"
              r={55}
              stroke="#D1FAE5"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="60"
              cy="70"
              r={55}
              stroke="#10B981"
              strokeWidth="10"
              fill="none"
              strokeDasharray={2 * Math.PI * 55}
              strokeDashoffset={2 * Math.PI * 55 - (2 * Math.PI * 55 * percentage / 100)}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
              style={{
                filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))',
              }}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 leading-none">
                {normalizedValue.toFixed(0)}
              </div>
              <div className="text-xs font-semibold text-gray-600 mt-1 uppercase tracking-wider">
                {unit}
              </div>
            </div>
          </div>
        </div>

      </div> */}


      {/* ============================================ */}
      {/* SECOND DESIGN - Progress Bar Speedometer */}
      {/* ============================================ */}
      {/* <div className="w-full bg-white rounded-xl p-3 shadow-lg">
        
     
        <div className="text-center mb-2">
          <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider">Speed</h3>
        </div>


        <div className="w-full mb-3">
    
          <div className="flex justify-between text-[10px] font-semibold text-gray-500 mb-1">
            <span>0</span>
            <span>25</span>
             <span>50</span>
              <span>75</span>
               <span>100</span>
                <span>125</span>
            <span>150 {unit}</span>
          </div>

         
          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-green rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${(normalizedValue / 175) * 100}%`,
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
              }}
            >
            
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
            
          </div>


          <div 
            className="relative mt-1"
            style={{ marginLeft: `${Math.min((normalizedValue / 150) * 100, 100)}%` }}
          >
           
          </div>
        </div>

    
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 leading-none">
            {normalizedValue.toFixed(0)}
          </div>
          <div className="text-xs font-semibold text-gray-600 mt-1 uppercase tracking-wider">
            {unit}
          </div>
        </div>

      </div> */}

      <div className="w-full bg-white rounded-xl p-3 shadow-lg">

  {/* Title */}
  <div className="text-center mb-2">
    <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider">Speed</h3>
  </div>

  {/* Flex container for progress bar + speed display side by side */}
  <div className="flex items-center space-x-4 mb-3">

    {/* Progress Bar Container */}
    <div className="flex-grow">
      {/* Speed Range Labels */}
      <div className="flex justify-between text-[10px] font-semibold text-gray-500 mb-1">
        <span>0</span>
       
        <span>50</span>
        
        <span>100</span>
       
        <span>150 {unit}</span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-green rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${(normalizedValue / 175) * 100}%`,
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
          }}
        >
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>

    {/* Speed Display - next to progress bar */}
    <div className="text-center flex flex-col items-center justify-center min-w-[40px]">
      <div className="text-xl font-bold text-green leading-none">
        {normalizedValue.toFixed(0)}
      </div>
      <div className="text-xs font-semibold text-gray-600 mt-1 uppercase tracking-wider">
        {unit}
      </div>
    </div>

  </div>

</div>


    </div>
  );
};

export default CustomSpeedometer;

