import React from 'react';

const ClassABCLogo = () => {
    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <svg width="320" height="100" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg" style={{ height: 'clamp(50px, 6vw, 80px)', width: 'auto' }}>

                <g>
                    <rect x="2" y="8" width="80" height="85" rx="10" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2"/>

                    <g transform="translate(12, 20)">
                        <circle cx="8" cy="8" r="5" fill="#10B981"/>
                        <rect x="2" y="14" width="12" height="12" rx="2" fill="#10B981" opacity="0.7"/>
                        <rect x="3" y="27" width="10" height="2" fill="#7C3AED"/>
                    </g>

                    <g transform="translate(32, 20)">
                        <circle cx="8" cy="8" r="5" fill="#F59E0B"/>
                        <rect x="2" y="14" width="12" height="12" rx="2" fill="#F59E0B" opacity="0.7"/>
                        <rect x="3" y="27" width="10" height="2" fill="#7C3AED"/>
                    </g>

                    <g transform="translate(52, 20)">
                        <circle cx="8" cy="8" r="5" fill="#8B5CF6"/>
                        <rect x="2" y="14" width="12" height="12" rx="2" fill="#8B5CF6" opacity="0.7"/>
                        <rect x="3" y="27" width="10" height="2" fill="#7C3AED"/>
                    </g>

                    <g transform="translate(12, 55)">
                        <circle cx="8" cy="8" r="5" fill="#EC4899"/>
                        <rect x="2" y="14" width="12" height="12" rx="2" fill="#EC4899" opacity="0.7"/>
                        <rect x="3" y="27" width="10" height="2" fill="#7C3AED"/>
                    </g>

                    <g transform="translate(32, 55)">
                        <circle cx="8" cy="8" r="5" fill="#06B6D4"/>
                        <rect x="2" y="14" width="12" height="12" rx="2" fill="#06B6D4" opacity="0.7"/>
                        <rect x="3" y="27" width="10" height="2" fill="#7C3AED"/>
                    </g>

                    <g transform="translate(52, 55)">
                        <circle cx="8" cy="8" r="5" fill="#F97316"/>
                        <rect x="2" y="14" width="12" height="12" rx="2" fill="#F97316" opacity="0.7"/>
                        <rect x="3" y="27" width="10" height="2" fill="#7C3AED"/>
                    </g>
                </g>

                <text x="95" y="40" fontFamily="comic sans ms , sans-serif" fontSize="32" fontWeight="800" fill="#5e6063ff">
                    Klasiz
                </text>

                <text x="135" y="75" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="800" fill="#3B82F6">
                    .fun
                </text>

                <text x="95" y="92" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="600" fill="#64748B" letterSpacing="0.5">
                    Smart Class Management
                </text>
            </svg>
        </div>
    );
};

export default ClassABCLogo;