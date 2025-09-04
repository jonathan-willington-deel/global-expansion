import React from 'react'

const Chevron = ({ 
  expanded = false, 
  size = 16, 
  className = '', 
  color = '#6b7280',
  style = {} 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height={size} 
      viewBox="0 -960 960 960" 
      width={size} 
      fill={color}
      className={`chevron-icon ${expanded ? 'expanded' : ''} ${className}`}
      style={{
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        ...style
      }}
    >
      <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
    </svg>
  )
}

export default Chevron
