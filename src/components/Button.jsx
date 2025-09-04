import React from 'react'

const SIZE_TO_STYLE = {
  sm: {
    padding: '6px 10px',
    fontSize: 14,
    gap: 6,
  },
  md: {
    padding: '8px 12px',
    fontSize: 14,
    gap: 8,
  },
  lg: {
    padding: '10px 16px',
    fontSize: 16,
    gap: 10,
  },
}

const VARIANT_TO_STYLE = {
  primary: {
    backgroundColor: '#6b7280',
    color: '#ffffff',
    border: '1px solid transparent',
  },
  secondary: {
    backgroundColor: '#6b7280',
    color: '#ffffff',
    border: '1px solid transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: '1px solid #6b7280',
  },
}

function Spinner({ color = 'currentColor' }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: `2px solid ${color}40`,
        borderTopColor: color,
        animation: 'ui-spin 0.8s linear infinite',
      }}
    />
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  type = 'button',
  onClick,
  children,
  style,
  ...rest
}) {
  const sizeStyle = SIZE_TO_STYLE[size] || SIZE_TO_STYLE.md
  const variantStyle = VARIANT_TO_STYLE[variant] || VARIANT_TO_STYLE.primary

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizeStyle.gap,
        padding: sizeStyle.padding,
        fontSize: sizeStyle.fontSize,
        fontWeight: 600,
        lineHeight: 1,
        borderRadius: 8,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        width: fullWidth ? '100%' : undefined,
        ...variantStyle,
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <Spinner color={variant === 'ghost' ? '#6b7280' : '#ffffff'} />
      ) : (
        <>
          {leftIcon ? <span style={{ display: 'inline-flex' }}>{leftIcon}</span> : null}
          <span>{children}</span>
          {rightIcon ? <span style={{ display: 'inline-flex' }}>{rightIcon}</span> : null}
        </>
      )}
    </button>
  )
}

export default Button


