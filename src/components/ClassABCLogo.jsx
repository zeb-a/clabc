import React from 'react';

const ClassABCLogo = () => {


    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'clamp(18px, 1.5vw, 36px)', width: 'clamp(120px, 20vw, 420px)' }}>
            <svg width="100%" style={{ height: 'auto' }} viewBox="0 0 360 140" preserveAspectRatio="xMinYMid meet"
                xmlns="http://www.w3.org/2000/svg">

                {/* <!-- Background Circle --> */}
                <circle cx="70" cy="70" r="60" fill="#E0F2FE" />

                {/* <!-- Star --> */}
                <polygon
                    points="70,20 82,52 116,52 88,72
            100,104 70,84 40,104
            52,72 24,52 58,52"
                    fill="#FACC15"
                    stroke="#F59E0B"
                    strokeWidth="2" />

                {/* <!-- Star Face --> */}
                <circle cx="60" cy="66" r="3" fill="#1F2937" />
                <circle cx="80" cy="66" r="3" fill="#1F2937" />
                <path d="M62 76 Q70 82 78 76"
                    stroke="#1F2937"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round" />

                {/* <!-- Clipboard --> */}
                <rect x="26" y="86" width="28" height="32"
                    rx="4" fill="#FFFFFF" stroke="#CBD5E1" />
                <rect x="32" y="92" width="16" height="4" fill="#22C55E" />
                <rect x="32" y="100" width="16" height="4" fill="#CBD5E1" />

                {/* <!-- Chart --> */}
                <rect x="86" y="86" width="36" height="32"
                    rx="4" fill="#FFFFFF" stroke="#CBD5E1" />
                <rect x="92" y="104" width="6" height="10" fill="#2563EB" />
                <rect x="102" y="98" width="6" height="16" fill="#2563EB" />
                <rect x="112" y="92" width="6" height="22" fill="#22C55E" />

                {/* <!-- Checkmark --> */}
                <path d="M88 36 L94 42 L106 30"
                    stroke="#22C55E"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round" />

                {/* <!-- Text --> */}
                <text x="150" y="78"
                    fontFamily="Cmic Sans Ms, Arial, sans-serif"
                    fontSize="36"
                    fontWeight="700"
                    fill="#2563EB">
                    Class
                </text>

                <text x="230" y="104"
                    fontFamily="Chulkbuster, Arial, sans-serif"
                    fontSize="36"
                    fontWeight="700"
                    fill="#F97316">
                    ABC
                </text>

                {/* <!-- Tagline --> */}
                <text x="150" y="124"
                    fontFamily="Inter, Arial, sans-serif"
                    fontSize="14"
                    fill="#64748B">
                    Track · Reward · Report
                </text>

            </svg>


        </div>
    );
};

export default ClassABCLogo;