import React, { useState, useEffect, useRef } from 'react';

export default function VantaBirds({
    color1 = "#D9A036",
    color2 = "#A07828",
    backgroundColor = "#171411",
    backgroundAlpha = 1.0,
    quantity = 4,
    birdSize = 1.0,
    speedLimit = 5.0,
    wingSpan = 30.0,
}) {
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);

    useEffect(() => {
        const loadScripts = async () => {
            if (!window.THREE) {
                const threeScript = document.createElement('script');
                threeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js";
                document.head.appendChild(threeScript);
                await new Promise(resolve => threeScript.onload = resolve);
            }

            if (!window.VANTA) {
                const vantaScript = document.createElement('script');
                vantaScript.src = "https://cdn.jsdelivr.net/gh/tengbao/vanta/dist/vanta.birds.min.js";
                document.head.appendChild(vantaScript);
                await new Promise(resolve => vantaScript.onload = resolve);
            }

            if (!vantaEffect && vantaRef.current && window.VANTA) {
                try {
                    const effect = window.VANTA.BIRDS({
                        el: vantaRef.current,
                        THREE: window.THREE,
                        mouseControls: true,
                        touchControls: true,
                        gyroControls: true,
                        minHeight: 200.00,
                        minWidth: 200.00,
                        scale: 1.00,
                        scaleMobile: 1.00,
                        backgroundColor,
                        backgroundAlpha,
                        color1,
                        color2,
                        colorMode: "lerp",
                        birdSize,
                        wingSpan,
                        speedLimit,
                        separation: 20.00,
                        alignment: 20.00,
                        cohesion: 20.00,
                        quantity,
                    });
                    setVantaEffect(effect);
                } catch (err) {
                    console.error("[Vanta.js] Init error:", err);
                }
            }
        };

        loadScripts();

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect, backgroundColor, backgroundAlpha, color1, color2, quantity, birdSize, speedLimit, wingSpan]);

    return (
        <div
            ref={vantaRef}
            className="absolute inset-0 w-full h-full z-0"
            style={{ pointerEvents: 'none' }}
        />
    );
}
