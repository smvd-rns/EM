import React, { useState, useEffect, useRef } from 'react';

const FadeInSection = ({ children, delay = '0s' }) => {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            });
        }, { threshold: 0.15 });

        const currentRef = domRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            style={{ transitionDelay: delay }}
        >
            {children}
        </div>
    );
};

export default FadeInSection;
