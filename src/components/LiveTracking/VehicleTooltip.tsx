// components/VehicleTooltip.tsx
import { VehicleData } from '@/types/vehicle';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import FuelGauge from './FuelGuage';
import { Close } from '@mui/icons-material';
const VehicleTooltip = ({
    vehicleData,
    allfields,
    position,
    onClose
}: {
    vehicleData: VehicleData,
    allfields: any[],
    position: { top: number, left: number },
    onClose: () => void
}) => {
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const getNestedValue = (obj: any, path: string) => {
        const keys = path.split('.');
        for (let key of keys) {
            if (obj && obj.hasOwnProperty(key)) {
                obj = obj[key];
            } else {
                return undefined;
            }
        }
        return obj;
    };

    return createPortal(

        <div
            ref={tooltipRef}
            id="vehicle-tooltip"
            className="fixed z-[1000] bg-white shadow-2xl rounded-lg p-4 w-72 max-h-[60vh] overflow-y-auto border border-gray-200"
            style={{
                top: `${position.top}px`,
                left: `${Math.min(position.left + 15, typeof window !== 'undefined' ? window.innerWidth - 250 : position.left + 15)}px`, // Prevent going off right
                // left: `${position.left}px`
            }}
        >
            {/* Tooltip Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800">
                    {vehicleData.vehicleReg}
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <Close fontSize="small" />
                </button>
            </div>

            {/* Tooltip Content */}
            <div className="space-y-3">
                {allfields?.map((attribute) => {
                    const value = getNestedValue(vehicleData, attribute.key);

                    if (attribute.key === "gpsStatus") {
                        const targetTimeDate = new Date(vehicleData.utctimestamp);
                        const currentTimeDate = new Date();
                        const timeDiffMinutes = Math.abs(targetTimeDate.getTime() - currentTimeDate.getTime()) / (1000 * 60);
                        const status = timeDiffMinutes > 120 ? "Off" : "On";
                        return (
                            <div key={attribute.key} className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">{attribute?.label}</span>
                                <span className={`text-sm font-semibold ${status === "On" ? "text-green-600" : "text-red-600"}`}>
                                    {status}
                                </span>
                            </div>
                        );
                    }
                    if (attribute.key == "handbrak") {
                        return (<div key={attribute.key} className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">{attribute.label}</span>
                            <span className="text-sm font-semibold text-gray-800 text-right">
                                {`${attribute?.prefix || ''}${value ? "Active" : "InActive"}${attribute.suffix || ''}`}
                            </span>
                        </div>)
                    }

                    if (
                        attribute.key.includes("door") ||
                        attribute.key.includes("trunk") ||
                        attribute.key.includes("Lock")

                    ) {
                        return (<div key={attribute.key} className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">{attribute.label}</span>
                            <span className="text-sm font-semibold text-gray-800 text-right">
                                {`${attribute?.prefix || ''}${value ? "Open" : "Closed"}${attribute.suffix || ''}`}
                            </span>
                        </div>)
                    }


                    if (
                        attribute.key.includes("switch")

                    ) {
                        return (<div key={attribute.key} className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">{attribute.label}</span>
                            <span className="text-sm font-semibold text-gray-800 text-right">
                                {`${attribute?.prefix || ''}${value ? "Pushed" : "Released"}${attribute.suffix || ''}`}
                            </span>
                        </div>)
                    }


                    if (
                        attribute.key.includes("lamp")
                    ) {
                        return (<div key={attribute.key} className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">{attribute.label}</span>
                            <span className="text-sm font-semibold text-gray-800 text-right">
                                {`${attribute?.prefix || ''}${value ? "On" : "Off"}${attribute.suffix || ''}`}
                            </span>
                        </div>)
                    }

                    if (attribute.key.includes("seatBelt")) {
                        return (<div key={attribute.key} className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">{attribute.label}</span>
                            <span className="text-sm font-semibold text-gray-800 text-right">
                                {`${attribute?.prefix || ''}${value ? "Fastened" : "Not fastened"}${attribute.suffix || ''}`}
                            </span>
                        </div>)
                    }


                    if ((attribute.key == "fuel" || attribute.key == "fuelp") && value) {
                        return (
                            <div key={attribute.key} className="flex items-center gap-2 justify-between">

                                <span className="text-sm font-medium text-gray-600">{attribute?.label}</span>

                                <FuelGauge fuelLevel={parseInt(value)} prefix={attribute.prefix} suffix={attribute.suffix} />
                            </div>
                        );
                    }
                    if (value) {
                        return (
                            <div key={attribute.key} className="flex justify-between">
                                <span className="text-sm font-medium text-gray-600">{attribute.label}</span>
                                <span className="text-sm font-semibold text-gray-800 text-right">
                                    {`${attribute?.prefix || ''}${value}${attribute.suffix || ''}`
                                        .replaceAll("undefined", "")
                                        .replaceAll("NaN", "0")}
                                </span>
                            </div>
                        );
                    }
                    return null
                })}
            </div>
        </div>,
        document.body
    );
};
export default VehicleTooltip;
