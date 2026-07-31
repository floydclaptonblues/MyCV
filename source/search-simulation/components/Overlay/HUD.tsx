import React from 'react';
import { MarkerType } from '../../types';

interface HUDProps {
  boatRef: React.MutableRefObject<{ lat: number; lon: number; heading: number } | null>;
  gpsActive: boolean;
  onToggleGps: () => void;
  onDropMarker: (type: MarkerType) => void;
  markerCount: number;
}

const HUD: React.FC<HUDProps> = ({ boatRef, gpsActive, onToggleGps, onDropMarker, markerCount }) => {
  const [displayData, setDisplayData] = React.useState({ lat: '---', lon: '---', heading: '---' });

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (boatRef.current) {
        const { lat, lon, heading } = boatRef.current;
        let h = (heading * 180 / Math.PI) % 360;
        if (h < 0) h += 360;
        setDisplayData({
          lat: lat.toFixed(5),
          lon: Math.abs(lon).toFixed(5),
          heading: h.toFixed(0).padStart(3, '0')
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [boatRef]);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10 select-none">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="bg-slate-900/90 backdrop-blur border border-teal-500/30 p-4 rounded-lg shadow-lg shadow-teal-500/10 text-teal-50 min-w-[200px] pointer-events-auto">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-lg font-bold tracking-widest text-teal-400 uppercase">N80FP Search</h1>
              <div className="text-[10px] text-teal-200/70">Lake Pontchartrain Sector</div>
            </div>
            <div className={`w-3 h-3 rounded-full ${gpsActive ? 'bg-green-500 animate-pulse' : 'bg-red-900'}`} title="GPS Status" />
          </div>
          <div className="mt-2 text-xs font-mono space-y-1 bg-black/40 p-2 rounded border border-teal-500/10">
            <div className="flex justify-between"><span className="opacity-50">LAT</span><span>{displayData.lat}° N</span></div>
            <div className="flex justify-between"><span className="opacity-50">LON</span><span>{displayData.lon}° W</span></div>
            <div className="flex justify-between"><span className="opacity-50">HDG</span><span>{displayData.heading}°</span></div>
          </div>
          <button onClick={onToggleGps} className={`mt-3 w-full py-1.5 px-3 rounded text-xs font-bold uppercase tracking-wide transition-colors ${gpsActive ? 'bg-teal-500 text-black hover:bg-teal-400' : 'bg-slate-700 text-teal-100 hover:bg-slate-600 border border-teal-500/30'}`}>
            {gpsActive ? 'GPS ACTIVE' : 'ENABLE GPS'}
          </button>
        </div>

        <div className="bg-slate-900/90 backdrop-blur border border-teal-500/30 p-4 rounded-lg shadow-lg pointer-events-auto">
          <div className="text-xs font-bold text-teal-400 mb-2 uppercase border-b border-teal-500/30 pb-1 flex justify-between">
            <span>Drop Markers</span><span>{markerCount} Active</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onDropMarker('clear')} className="flex flex-col items-center gap-1 p-2 bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 rounded w-16 group transition-all"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-[9px] uppercase font-bold text-green-100">Clear</span></button>
            <button onClick={() => onDropMarker('debris')} className="flex flex-col items-center gap-1 p-2 bg-yellow-900/30 hover:bg-yellow-900/50 border border-yellow-500/30 rounded w-16 group transition-all"><div className="w-3 h-3 bg-yellow-400 rotate-45" /><span className="text-[9px] uppercase font-bold text-yellow-100">Debris</span></button>
            <button onClick={() => onDropMarker('crash')} className="flex flex-col items-center gap-1 p-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 rounded w-16 group transition-all"><div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-red-500" /><span className="text-[9px] uppercase font-bold text-red-100">Crash</span></button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 pointer-events-auto">
        {!gpsActive && <div className="bg-slate-900/60 backdrop-blur px-4 py-2 rounded-lg border border-teal-500/20 text-[10px] text-teal-200/60">Manual Mode: WASD to Drive • Q/E to Slide • Mouse to Look</div>}
        <div className="bg-slate-900/60 backdrop-blur px-6 py-2 rounded-full border border-teal-500/20 text-[10px] uppercase tracking-wider text-teal-200/60">Search Area: ~0.9 NM × ~0.5 NM Ellipse</div>
      </div>
    </div>
  );
};

export default HUD;
