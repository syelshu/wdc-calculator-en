import React, { useState, useMemo } from 'react';
import { Trophy, RotateCcw, ChevronDown, Crown, Info } from 'lucide-react';

// --- Data & Constants ---

// Standard F1 Points System
const POINTS_GP = {
  1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1
};

const POINTS_SPRINT = {
  1: 8, 2: 7, 3: 6, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1
};

// Fixed Results for Completed Races (Qatar Sprint)
const FIXED_RESULTS = {
  qatar_sprint: {
    pia: '1',
    nor: '3',
    ver: '4'
  }
};

// 2025 Top 3 Contenders (Updated Post-Qatar Sprint)
const INITIAL_DRIVERS = [
  { 
    id: 'nor', 
    number: 4, 
    name: 'Lando Norris',
    shortName: 'NOR', 
    team: 'McLaren', 
    color: '#ff8000', 
    points: 396, // 390 + 6 (P3 Sprint)
    gpWins: 7, 
    gpP2s: 8   
  },
  { 
    id: 'pia', 
    number: 81, 
    name: 'Oscar Piastri', 
    shortName: 'PIA',
    team: 'McLaren', 
    color: '#ff8000', 
    points: 374, // 366 + 8 (P1 Sprint)
    gpWins: 7, 
    gpP2s: 3
  },
  { 
    id: 'ver', 
    number: 1, 
    name: 'Max Verstappen', 
    shortName: 'VER',
    team: 'Red Bull', 
    color: '#1e41ff', 
    points: 371, // 366 + 5 (P4 Sprint)
    gpWins: 6, 
    gpP2s: 5
  }
];

// Remaining Races - Simplified Headers for Mobile
// Marked qatar_sprint as finished
const RACES = [
  { id: 'qatar_sprint', name: 'Qatar Sprint', type: 'SPRINT', header: 'QAT', sub: 'Spr', mobileHeader: 'Q.S', isFinished: true },
  { id: 'qatar_gp', name: 'Qatar GP', type: 'GP', header: 'QAT', sub: 'GP', mobileHeader: 'Q.G', isFinished: false },
  { id: 'abu_dhabi', name: 'Abu Dhabi GP', type: 'GP', header: 'ABU', sub: 'GP', mobileHeader: 'A.D', isFinished: false },
];

const POSITION_OPTIONS = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' },
  { value: '11', label: '11' },
  { value: '12', label: '12' },
  { value: '13', label: '13' },
  { value: '14', label: '14' },
  { value: '15', label: '15' },
  { value: '16', label: '16' },
  { value: '17', label: '17' },
  { value: '18', label: '18' },
  { value: '19', label: '19' },
  { value: '20', label: '20' },
  { value: 'DNF', label: 'DNF' },
  { value: 'DSQ', label: 'DSQ' },
  { value: 'DNS', label: 'DNS' },
];

export default function F1Calculator() {
  // State
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [predictions, setPredictions] = useState({});

  // Reset all predictions
  const handleReset = () => {
    if (window.confirm('Reset all predictions?')) {
      setPredictions({});
      setDrivers(INITIAL_DRIVERS);
    }
  };

  // Handle selection change
  const handlePredictionChange = (driverId, raceId, value) => {
    setPredictions(prev => ({
      ...prev,
      [driverId]: {
        ...prev[driverId],
        [raceId]: value
      }
    }));
  };

  // Check if position is used in a specific race column
  const getUsedPositions = (raceId) => {
    const used = new Set();
    Object.values(predictions).forEach(driverPreds => {
      const val = driverPreds[raceId];
      if (val && !['DNF', 'DSQ', 'DNS'].includes(val)) {
        used.add(val);
      }
    });
    return used;
  };

  // --- Calculation Logic ---
  const calculatedData = useMemo(() => {
    const processed = drivers.map(driver => {
      let projectedPoints = 0;
      let newWins = 0;
      let newP2s = 0;
      
      RACES.forEach(race => {
        // If race is finished, points are already in 'driver.points', so skip calc
        if (race.isFinished) return;

        const pred = predictions[driver.id]?.[race.id];
        if (pred && pred !== 'DNF' && pred !== 'DSQ' && pred !== 'DNS') {
          const pos = parseInt(pred);
          if (race.type === 'GP') {
            projectedPoints += (POINTS_GP[pos] || 0);
            if (pos === 1) newWins += 1;
            if (pos === 2) newP2s += 1;
          } else {
            projectedPoints += (POINTS_SPRINT[pos] || 0);
          }
        }
      });

      return {
        ...driver,
        projectedPoints,
        totalScore: driver.points + projectedPoints,
        projectedWins: driver.gpWins + newWins,
        projectedP2s: driver.gpP2s + newP2s
      };
    });

    // Automatic Sort Logic with Tie-Breaker
    const sorted = [...processed].sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.projectedWins !== a.projectedWins) return b.projectedWins - a.projectedWins;
      if (b.projectedP2s !== a.projectedP2s) return b.projectedP2s - a.projectedP2s;
      return b.points - a.points;
    });

    const winnerId = sorted[0].id;
    return { sortedDrivers: sorted, winnerId };
  }, [drivers, predictions]);

  const { sortedDrivers, winnerId } = calculatedData;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">
      {/* Header */}
      <header className="bg-slate-900 text-white p-3 shadow-lg sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Trophy Icon - Gold */}
            <div className="p-1.5 bg-yellow-500 rounded-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide leading-tight">WDC Calculator</h1>
              <p className="text-[10px] text-slate-400">Predict the 2025 WDC Winner</p>
            </div>
          </div>
          
          <button 
            onClick={handleReset}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto">
        
        <div className="bg-white shadow-sm border-b border-slate-200 md:border md:rounded-xl md:mt-4 overflow-hidden">
          <div className="overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  {/* Driver Column */}
                  <th className="px-2 py-3 bg-slate-100 w-[32%] border-r border-slate-200">
                    Driver / Stats
                  </th>
                  
                  {/* Races */}
                  {RACES.map(race => (
                    <th key={race.id} className="px-1 py-3 text-center w-[17%]">
                      <div className="flex flex-col items-center leading-tight">
                        <span className="font-bold text-slate-800">{race.mobileHeader}</span>
                        <span className={`scale-75 px-1 rounded -mt-0.5 ${race.type === 'SPRINT' ? 'text-orange-600' : 'text-green-600'}`}>
                          {race.sub}
                        </span>
                      </div>
                    </th>
                  ))}

                  {/* Total */}
                  <th className="px-1 pr-4 py-3 text-right w-[17%] font-bold text-slate-800">
                    Total
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedDrivers.map((driver, index) => {
                  const isWinner = driver.id === winnerId;
                  const rank = index + 1;

                  return (
                    <tr 
                      key={driver.id} 
                      className={`
                        transition-all duration-300 ease-in-out group h-16
                        ${isWinner ? 'bg-cyan-50' : 'bg-white'}
                      `}
                    >
                      {/* Driver Name & Stats Combined */}
                      <td className={`
                        px-2 py-2 border-r border-slate-200 align-middle
                        ${isWinner ? 'bg-cyan-50' : 'bg-white'}
                      `}>
                        <div className="flex flex-col gap-1">
                          {/* Name Row */}
                          <div className="flex items-center gap-1.5">
                             <div 
                              className="w-1 h-3 rounded-full shrink-0" 
                              style={{ backgroundColor: driver.color }}
                            />
                            {/* Flex container for name + crown to prevent truncation */}
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="font-bold text-slate-800 text-sm leading-none whitespace-nowrap">
                                {driver.shortName}
                              </span>
                              {isWinner && <Crown className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                            </div>
                          </div>

                          {/* Stats Row (Read Only Text) */}
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-medium text-slate-600">{driver.points} Pts</span>
                            <span className="text-slate-300">|</span>
                            <span className="font-medium text-slate-600">{driver.gpWins} Wins</span>
                          </div>
                        </div>
                      </td>

                      {/* Race Dropdowns / Static Results */}
                      {RACES.map(race => {
                        // Check if race is finished
                        if (race.isFinished) {
                          const result = FIXED_RESULTS[race.id]?.[driver.id] || '-';
                          let resultBg = 'bg-slate-50 text-slate-400'; // Default
                          if (result === '1') resultBg = 'bg-yellow-100 text-yellow-800 border-yellow-200 font-bold';
                          if (result === '2') resultBg = 'bg-slate-100 text-slate-700 border-slate-200 font-bold';
                          if (result === '3') resultBg = 'bg-orange-100 text-orange-800 border-orange-200 font-bold';
                          if (['4','5','6','7','8'].includes(result)) resultBg = 'bg-green-50 text-green-700 border-green-100 font-medium';

                          return (
                            <td key={race.id} className="px-1 py-2 align-middle text-center">
                              <div className={`
                                flex items-center justify-center w-full h-8 rounded border text-xs
                                ${resultBg} border-opacity-50
                              `}>
                                P{result}
                              </div>
                            </td>
                          );
                        }

                        // --- Interactive Dropdowns for Future Races ---
                        const selection = predictions[driver.id]?.[race.id] || '';
                        const usedPositions = getUsedPositions(race.id);

                        let cellBg = '';
                        let textColor = 'text-slate-400';
                        
                        if (selection === '1') { cellBg = 'bg-amber-50 text-amber-700 font-bold border-amber-200'; }
                        else if (selection === '2') { cellBg = 'bg-slate-50 text-slate-600 font-bold border-slate-200'; }
                        else if (selection === '3') { cellBg = 'bg-orange-50 text-orange-700 font-bold border-orange-200'; }
                        else if (['DNF', 'DSQ', 'DNS'].includes(selection)) { cellBg = 'bg-red-50 text-red-500 border-red-100'; }
                        else if (selection) { textColor = 'text-slate-900'; }

                        return (
                          <td key={race.id} className="px-1 py-2 align-middle text-center">
                            <div className="relative flex justify-center">
                              <select
                                value={selection}
                                onChange={(e) => handlePredictionChange(driver.id, race.id, e.target.value)}
                                className={`
                                  appearance-none text-center cursor-pointer
                                  w-full h-8 rounded border text-xs font-medium p-0
                                  focus:outline-none focus:ring-1 focus:ring-blue-500
                                  [text-align-last:center]
                                  ${selection ? 'border-transparent shadow-sm' : 'border-slate-200 bg-slate-50'}
                                  ${cellBg} ${!selection ? textColor : ''}
                                `}
                              >
                                <option value="">-</option>
                                {POSITION_OPTIONS.map(opt => {
                                  const isDisabled = usedPositions.has(opt.value) && selection !== opt.value;
                                  return <option key={opt.value} value={opt.value} disabled={isDisabled}>{opt.label}</option>;
                                })}
                              </select>
                            </div>
                          </td>
                        );
                      })}

                      {/* Total Score */}
                      <td className="px-1 pr-4 py-2 align-middle text-right">
                        <div className="flex flex-col items-end justify-center">
                          <span className={`text-base font-bold leading-none ${isWinner ? 'text-blue-700' : 'text-slate-800'}`}>
                            {driver.totalScore}
                          </span>
                          
                          {(driver.projectedPoints > 0 || driver.projectedWins > driver.gpWins) && (
                            <div className="flex flex-col items-end gap-0.5 mt-1">
                              {driver.projectedPoints > 0 && (
                                <span className="text-[9px] font-medium text-green-600 bg-green-50 px-1 rounded leading-none">
                                  +{driver.projectedPoints}
                                </span>
                              )}
                              <span className="text-[9px] text-slate-400 leading-none">
                                {driver.projectedWins} Wins
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Tie-Breaker Info */}
        <div className="mt-6 mx-4 md:mx-0 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-500">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-700">Tie-breaker Rules</p>
              <p>Points &gt; Wins &gt; P2 Finishes</p>
            </div>
          </div>
        </div>

        {/* Developer Footer */}
        <div className="mt-8 mb-4 text-[10px] text-slate-400 text-center">
          Developer: syelshu
        </div>

      </main>
    </div>
  );
}
