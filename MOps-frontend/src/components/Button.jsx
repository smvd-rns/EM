import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    loading = false,
    ...props
}) => {
    const baseStyles = "h-11 px-7 rounded-pill font-ui text-[14px] font-bold transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20 hover:scale-[1.02] active:scale-[0.96] select-none shadow-sm";

    const variants = {
        primary: "bg-primary text-white border-t border-white/20 shadow-lg shadow-primary/25",
        secondary: "bg-primary-container text-primary border border-primary/10",
        outline: "border border-outline text-on-surface-variant hover:bg-surface-variant/40 hover:border-on-surface-variant",
        ghost: "bg-transparent text-on-surface-variant hover:bg-surface-variant/50 shadow-none hover:shadow-sm",
        danger: "bg-error text-white border-t border-white/20 shadow-lg shadow-error/25",
    };

    return (
        <button
            className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : null}
            {children}
        </button>
    );
};

export default Button;
