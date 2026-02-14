"use client";

import { useState, useEffect } from 'react';

interface CountdownProps {
    targetDate: string | Date;
    onComplete?: () => void;
}

export default function Countdown({ targetDate, onComplete }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setIsExpired(true);
                if (onComplete) onComplete();
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onComplete]);

    if (isExpired) {
        return null; // Or return "Started" or similar
    }

    return (
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#ffcc00', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '4px' }}>
            <span>⏳</span>
            {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
            <span>{timeLeft.hours}h</span>
            <span>{timeLeft.minutes}m</span>
            <span>{timeLeft.seconds}s</span>
        </div>
    );
}
