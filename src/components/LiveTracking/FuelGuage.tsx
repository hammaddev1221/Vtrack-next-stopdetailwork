import React from "react";
import { FuelPumpDieselFill } from "react-bootstrap-icons";

type FuelGaugeProps = {
    fuelLevel: number; // Expected: 0 to 100,
    prefix: string, suffix: string
};

const FuelGauge: React.FC<FuelGaugeProps> = ({ fuelLevel, prefix, suffix }) => {
    const clampedLevel = Math.min(100, Math.max(0, fuelLevel));
    const rotation = (clampedLevel / 100) * 180 - 90;

    return (
        <div className="relative w-20 h-16">
            {/* Outer Gauge */}
            <svg viewBox="0 0 200 120" className="w-full h-full">
                {/* Red Arc */}
                <path
                    d="M30,100 A70,70 0 0,1 70,30"
                    fill="none"
                    stroke="#ff3b30"
                    strokeWidth="10"
                />
                {/* Yellow Arc */}
                <path
                    d="M70,30 A70,70 0 0,1 130,30"
                    fill="none"
                    stroke="#ffcc00"
                    strokeWidth="10"
                />
                {/* Green Arc */}
                <path
                    d="M130,30 A70,70 0 0,1 170,100"
                    fill="none"
                    stroke="#4cd964"
                    strokeWidth="10"
                />

                {/* Tick Marks */}
                {[...Array(5)].map((_, i) => {
                    const angle = (-150 + i * 30) * (Math.PI / 180); // -120° to 0° in 30° steps
                    const x1 = 100 + 65 * Math.cos(angle);
                    const y1 = 100 + 65 * Math.sin(angle);
                    const x2 = 100 + 75 * Math.cos(angle);
                    const y2 = 100 + 75 * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="black"
                            strokeWidth={i === 2 ? 4 : 2} // middle tick bolder
                        />
                    );
                })}
            </svg>



            {/* Needle Arrow */}
            <svg
        className="absolute left-1/2 bottom-[30%] w-[2px] h-[40%] bg-black origin-bottom"
        viewBox="0 0 100 100"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <polygon points="50,15 46,50 54,50" fill="red" />
      </svg>

            {/* Needle */}
            {/* <div
                className="absolute left-1/2 bottom-[10%] w-[2px] h-[42%] bg-black origin-bottom"
                style={{ transform: `rotate(${rotation}deg)` }}
            /> */}

            {/* Center Dot */}
            {/* <div className="absolute left-1/2 bottom-[10%] w-3 h-3 bg-black rounded-full -translate-x-1/2" /> */}
            {/* <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2" /> */}

            {/* Labels */}
            <div className="absolute left-1 bottom-[0.2rem] text-[12px] text-red-600">
                <FuelPumpDieselFill
                    size={10}
                    style={{
                        color: "black",
                        // marginRight: '2px'
                    }}
                />

            </div>
            {/* <div className="absolute right-1 bottom-[-0.1rem] text-[12px] text-black">Ful</div> */}
            {/* Fuel Percentage */}
            <div className="absolute left-1/2 bottom-[-0.1rem] text-[12px] text-black -translate-x-1/2">
                {`${prefix}${clampedLevel}${suffix}`?.replaceAll("undefined", "")?.replaceAll("NaN", "0")}
            </div>

        </div>
    );
};

export default FuelGauge;
