import React from 'react';

interface MobileToggleProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function MobileToggle({ id, checked, onCheckedChange, disabled = false }: MobileToggleProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: checked ? '#ff8c8c' : '#9ca3af',
        border: 'none',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 0.2s ease-in-out',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        outline: 'none',
        flexShrink: 0
      }}
      onFocus={(e) => {
        e.target.style.boxShadow = '0 0 0 2px rgba(255, 140, 140, 0.3)';
      }}
      onBlur={(e) => {
        e.target.style.boxShadow = 'none';
      }}
    >
      <span 
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
          transform: checked ? 'translateX(20px)' : 'translateX(0px)',
          transition: 'transform 0.2s ease-in-out',
          display: 'block',
          flexShrink: 0
        }}
      />
      <span className="sr-only">Toggle switch</span>
    </button>
  );
}