import React, { useState } from 'react';

const Input = ({ label, error, type, className = '', showPasswordToggle = false, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPasswordToggle && showPassword ? 'text' : type;

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-[14px] font-medium font-ui text-on-surface ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    type={inputType}
                    className={`
          w-full h-12 px-4 rounded-xl border text-[15px] outline-none transition-all duration-300 font-body
          ${error
                            ? 'border-error ring-1 ring-error/20 bg-error-container/5'
                            : 'border-outline focus:border-primary focus:ring-4 focus:ring-primary/10 hover:border-on-surface-variant/40 bg-white'
                        }
          ${isPassword && showPasswordToggle ? 'pr-12' : ''}
          text-on-surface placeholder:text-on-surface-variant/40 shadow-sm focus:shadow-md
          ${className}
        `}
                    {...props}
                />
                {isPassword && showPasswordToggle && (
                    <button
                        type="button"
                        tabIndex="-1"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors p-2 flex items-center justify-center"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {error && <span className="text-[12px] text-error ml-1 font-ui">{error}</span>}
        </div>
    );
};

export default Input;
