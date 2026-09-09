import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export function SelectDropdown({ value, options, onChange, className = '', ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedOption = options.find(option => option.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`select-dropdown ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`select-dropdown-trigger ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(current => !current)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <span>{selectedOption.label}</span>
        <ChevronDown size={14} className="select-dropdown-chevron" />
      </button>

      {isOpen && (
        <div className="select-dropdown-menu" role="listbox" aria-label={ariaLabel}>
          {options.map(option => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`select-dropdown-option ${option.value === value ? 'is-selected' : ''}`}
              key={option.value}
              onClick={() => handleOptionSelect(option.value)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
