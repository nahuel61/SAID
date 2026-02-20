import React, { useMemo, useState, memo } from 'react';
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    Line
} from 'react-simple-maps';
import { useData } from '../../context/DataContext';
import { groupByCountry, matchGeoToCountry } from '../../utils/mapHelpers';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const FORCE_COLORS = {
    EA: '#6b7f3e',   // Verde oliva
    ARA: '#002395',  // Azul francia
    FAA: '#87CEEB'   // Celeste
};

const BUENOS_AIRES = [-58.4, -34.6];

const getPinColor = (countryData) => {
    if (countryData.EA >= countryData.ARA && countryData.EA >= countryData.FAA) {
        return FORCE_COLORS.EA;
    } else if (countryData.ARA >= countryData.FAA) {
        return FORCE_COLORS.ARA;
    }
    return FORCE_COLORS.FAA;
};

const MapChart = memo(({ deploymentsByCountry, hoveredCountry, setHoveredCountry }) => {
    // Set of country names that have deployments
    const countriesWithPresence = useMemo(() => {
        const set = new Set();
        deploymentsByCountry.forEach(d => {
            set.add(d.country.toUpperCase().trim());
        });
        return set;
    }, [deploymentsByCountry]);

    return (
        <ComposableMap
            projectionConfig={{
                rotate: [-10, 0, 0],
                center: [0, 15],
                scale: 100
            }}
            width={800}
            height={250}
            style={{ width: '100%', height: '100%' }}
        >
            {/* Country shapes */}
            <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                    geographies.map((geo) => {
                        const name = geo.properties.name;
                        const isActive = matchGeoToCountry(name, countriesWithPresence);
                        return (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={isActive ? '#1e40af' : '#1e293b'}
                                stroke="#334155"
                                strokeWidth={0.5}
                                style={{
                                    default: { outline: 'none' },
                                    hover: {
                                        fill: isActive ? '#2563eb' : '#293548',
                                        outline: 'none',
                                    },
                                    pressed: { outline: 'none' }
                                }}
                            />
                        );
                    })
                }
            </Geographies>

            {/* Arc lines from Buenos Aires */}
            {deploymentsByCountry.map((d, i) => (
                <Line
                    key={`arc-${i}`}
                    from={BUENOS_AIRES}
                    to={d.coordinates}
                    stroke={`${getPinColor(d)}30`}
                    strokeWidth={1}
                    strokeLinecap="round"
                />
            ))}

            {/* Markers for each country */}
            {deploymentsByCountry.map((countryData, index) => {
                const color = getPinColor(countryData);
                const isHovered = hoveredCountry?.country === countryData.country;
                const r = Math.max(3, Math.min(8, countryData.total * 2));

                return (
                    <Marker
                        key={`marker-${index}`}
                        coordinates={countryData.coordinates}
                        onMouseEnter={() => setHoveredCountry(countryData)}
                        onMouseLeave={() => setHoveredCountry(null)}
                    >
                        {/* Pulse ring */}
                        <circle
                            r={r + 6}
                            fill="none"
                            stroke={color}
                            strokeWidth={1}
                            opacity={0.3}
                            className="animate-ping"
                            style={{ transformOrigin: 'center', animationDuration: '3s' }}
                        />
                        {/* Glow */}
                        <circle
                            r={r + 3}
                            fill={color}
                            opacity={isHovered ? 0.35 : 0.12}
                            style={{ transition: 'opacity 0.3s' }}
                        />
                        {/* Main dot */}
                        <circle
                            r={r}
                            fill={color}
                            stroke="#0f172a"
                            strokeWidth={1.5}
                            opacity={0.9}
                            style={{
                                cursor: 'pointer',
                                filter: isHovered ? `drop-shadow(0 0 6px ${color})` : 'none',
                                transition: 'filter 0.3s'
                            }}
                        />
                        {/* Count label */}
                        {countryData.total > 1 && r >= 5 && (
                            <text
                                textAnchor="middle"
                                y={1}
                                style={{
                                    fontFamily: 'system-ui, sans-serif',
                                    fontSize: '6px',
                                    fill: '#fff',
                                    fontWeight: 'bold',
                                    pointerEvents: 'none'
                                }}
                            >
                                {countryData.total}
                            </text>
                        )}
                    </Marker>
                );
            })}

            {/* Buenos Aires origin marker */}
            <Marker coordinates={BUENOS_AIRES}>
                <circle r={4} fill="#fff" opacity={0.9} />
                <circle r={2} fill="#3b82f6" />
            </Marker>
        </ComposableMap>
    );
});

export const WorldMap = () => {
    const { allAgregaduras } = useData();
    const [hoveredCountry, setHoveredCountry] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = React.useRef(null);

    const deploymentsByCountry = useMemo(() => {
        return groupByCountry(allAgregaduras);
    }, [allAgregaduras]);

    const handleMouseMove = (e) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    return (
        <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">Despliegue Global</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="material-icons text-sm">public</span>
                    <span>{deploymentsByCountry.length} países con presencia</span>
                </div>
            </div>

            <div
                ref={containerRef}
                className="relative overflow-hidden"
                style={{
                    background: 'radial-gradient(ellipse at 50% 50%, #0f1b2d 0%, #080e19 100%)',
                    minHeight: '200px'
                }}
                onMouseMove={handleMouseMove}
            >
                {/* Dot grid overlay */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)',
                        backgroundSize: '18px 18px'
                    }}
                />

                {/* Map */}
                <MapChart
                    deploymentsByCountry={deploymentsByCountry}
                    hoveredCountry={hoveredCountry}
                    setHoveredCountry={setHoveredCountry}
                />

                {/* Hover tooltip */}
                {hoveredCountry && (
                    <div
                        className="absolute bg-gray-900/95 backdrop-blur-sm text-white text-xs py-3 px-4 rounded-xl border border-gray-700/50 shadow-2xl min-w-[200px] z-30 animate-fade-in pointer-events-none"
                        style={{
                            left: `${Math.min(mousePos.x + 16, (containerRef.current?.offsetWidth || 600) - 220)}px`,
                            top: `${Math.max(8, Math.min(mousePos.y - 20, (containerRef.current?.offsetHeight || 400) - 200))}px`
                        }}
                    >
                        <p className="font-bold text-sm mb-2 flex items-center gap-2">
                            <span className="material-icons text-primary text-base">location_on</span>
                            {hoveredCountry.country}
                        </p>
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-700/50">
                            <span className="text-gray-400">Total personal</span>
                            <span className="font-bold text-lg">{hoveredCountry.total}</span>
                        </div>
                        <div className="space-y-1.5">
                            {hoveredCountry.EA > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: FORCE_COLORS.EA }} />
                                        <span className="text-gray-300">Ejército (EA)</span>
                                    </div>
                                    <span className="font-semibold" style={{ color: FORCE_COLORS.EA }}>{hoveredCountry.EA}</span>
                                </div>
                            )}
                            {hoveredCountry.ARA > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: FORCE_COLORS.ARA }} />
                                        <span className="text-gray-300">Armada (ARA)</span>
                                    </div>
                                    <span className="font-semibold" style={{ color: FORCE_COLORS.ARA }}>{hoveredCountry.ARA}</span>
                                </div>
                            )}
                            {hoveredCountry.FAA > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: FORCE_COLORS.FAA }} />
                                        <span className="text-gray-300">Fuerza Aérea (FAA)</span>
                                    </div>
                                    <span className="font-semibold" style={{ color: FORCE_COLORS.FAA }}>{hoveredCountry.FAA}</span>
                                </div>
                            )}
                        </div>
                        {/* Personnel list */}
                        {hoveredCountry.items && hoveredCountry.items.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-700/50 space-y-1">
                                {hoveredCountry.items.slice(0, 5).map((p, i) => (
                                    <p key={i} className="text-gray-400 text-[10px] truncate">
                                        • {p.gradoAbreviatura || p.grado} {p.apellidoNombre}
                                    </p>
                                ))}
                                {hoveredCountry.items.length > 5 && (
                                    <p className="text-gray-500 text-[10px]">
                                        y {hoveredCountry.items.length - 5} más...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Legend */}
                <div className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-sm p-3 rounded-xl border border-gray-700/50 text-xs text-white z-20">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: FORCE_COLORS.EA }} /> EA
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: FORCE_COLORS.ARA }} /> ARA
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: FORCE_COLORS.FAA }} /> FAA
                        </div>
                    </div>
                </div>

                {/* Origin badge */}
                <div className="absolute bottom-3 right-3 bg-gray-900/80 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-700/50 text-xs text-gray-400 z-20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Buenos Aires — Origen
                </div>

                {/* No data */}
                {deploymentsByCountry.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-center text-gray-500">
                            <span className="material-icons text-4xl mb-2 opacity-50">public_off</span>
                            <p className="text-sm">No hay agregadurías desplegadas</p>
                            <p className="text-xs mt-1">Agregá registros para ver el mapa</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
