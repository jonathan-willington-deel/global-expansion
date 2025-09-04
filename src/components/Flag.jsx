import React from 'react'
import { CircleFlag } from 'react-circle-flags'

// Country code mapping for flag library
const countryCodeMap = {
  'United States': 'US',
  'Netherlands': 'NL', 
  'Germany': 'DE',
  'India': 'IN',
  'Ukraine': 'UA',
  'Philippines': 'PH',
  'Paraguay': 'PY',
  'Argentina': 'AR',
  'South Africa': 'ZA'
}

const Flag = ({ countryName, countryCode, size = 'w-6 h-6', className = '' }) => {
  // Use provided country code or map from country name
  const code = countryCode || countryCodeMap[countryName]
  
  // Convert Tailwind size classes to pixel heights for CircleFlag
  const sizeMap = {
    'w-4 h-4': 16,
    'w-5 h-5': 20,
    'w-6 h-6': 24,
    'w-6 h-4': 24, // Special case for rectangular flags
    'w-8 h-8': 32,
    'w-10 h-10': 40,
    'w-12 h-12': 48
  }
  
  const flagHeight = sizeMap[size] || 24
  
  if (!code) {
    // Fallback to first letter if no code found
    return (
      <div className={`${size} bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 ${className}`}>
        {countryName?.charAt(0) || '?'}
      </div>
    )
  }
  
  return (
    <div className={`${className} inline-block`} style={{ width: flagHeight, height: flagHeight }}>
      <CircleFlag 
        countryCode={code.toLowerCase()} 
        height={flagHeight}
        alt={`${countryName || code} flag`}
      />
    </div>
  )
}

export default Flag
