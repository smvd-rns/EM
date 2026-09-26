import React from 'react';

const Card = ({ children, className = '', hoverEffect = false, ...props }) => {
    return (
        <div
            className={`
        bg-white rounded-lg shadow-sm border border-gray-100 p-6 
        ${hoverEffect ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-100' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
