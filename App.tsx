import React, { useState, useEffect, useCallback, memo } from 'react';

// --- TYPE DEFINITION ---
interface Trade {
  tradeNumber: number;
  startingBalance: number;
  change: number; // Represents both profit and loss
  endingBalance: number;
}

// --- CURRENCY FORMATTER ---
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// --- HELPER ICONS ---
const ChartUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const ChartDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
    </svg>
);

const DollarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 10v1m0-7v4m-5 2h10" />
  </svg>
);

const TargetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m13.314 0l-1.414-1.414M6.05 6.05l-1.414-1.414" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);


// --- SUB-COMPONENTS ---

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, colorClass }) => (
  <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

interface TradeTableRowProps {
  trade: Trade;
  note: string;
  onNoteChange: (note: string) => void;
  onFocusNote: (tradeNumber: number) => void;
}

const TradeTableRow: React.FC<TradeTableRowProps> = memo(({ trade, note, onNoteChange, onFocusNote }) => {
  const isProfit = trade.change >= 0;
  return (
    <tr className="hover:bg-gray-700/50 transition-colors duration-200">
      <td className="px-6 py-4 font-medium text-center text-gray-200">{trade.tradeNumber === 0 ? 'Start' : trade.tradeNumber}</td>
      <td className="px-6 py-4 text-gray-300">{trade.tradeNumber === 0 ? '-' : currencyFormatter.format(trade.startingBalance)}</td>
      <td className={`px-6 py-4 font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
        {trade.tradeNumber === 0 ? '-' : `${isProfit ? '+ ' : ''}${currencyFormatter.format(trade.change)}`}
      </td>
      <td className="px-6 py-4 font-bold text-cyan-300">{currencyFormatter.format(trade.endingBalance)}</td>
      <td className="px-6 py-4">
        <input
          id={`note-input-${trade.tradeNumber}`}
          type="text"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          onFocus={() => onFocusNote(trade.tradeNumber)}
          placeholder="আপনার নোট..."
          className="w-full bg-gray-700 border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 transition"
        />
      </td>
    </tr>
  );
});

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  // A function is passed to useState to read from localStorage only on the initial render.
  const [initialBalance, setInitialBalance] = useState<number>(() => {
    const saved = localStorage.getItem('tradingApp_initialBalance');
    return saved ? JSON.parse(saved) : 100;
  });
  const [rate, setRate] = useState<number>(() => {
    const saved = localStorage.getItem('tradingApp_rate');
    return saved ? JSON.parse(saved) : 30;
  });
  const [numberOfTrades, setNumberOfTrades] = useState<number>(() => {
    const saved = localStorage.getItem('tradingApp_numberOfTrades');
    return saved ? JSON.parse(saved) : 30;
  });
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('tradingApp_trades');
    return saved ? JSON.parse(saved) : [];
  });
  const [notes, setNotes] = useState<string[]>(() => {
    const saved = localStorage.getItem('tradingApp_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [timerDuration, setTimerDuration] = useState<number>(() => {
    const saved = localStorage.getItem('tradingApp_timerDuration');
    return saved ? JSON.parse(saved) : 10;
  });
  
  // Modal and other UI state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [postTimerAction, setPostTimerAction] = useState<(() => void) | null>(null);
  const [unlockedNotes, setUnlockedNotes] = useState<Set<number>>(new Set());

  // --- LOCALSTORAGE PERSISTENCE ---
  useEffect(() => {
    try {
      localStorage.setItem('tradingApp_initialBalance', JSON.stringify(initialBalance));
      localStorage.setItem('tradingApp_rate', JSON.stringify(rate));
      localStorage.setItem('tradingApp_numberOfTrades', JSON.stringify(numberOfTrades));
      localStorage.setItem('tradingApp_timerDuration', JSON.stringify(timerDuration));
      localStorage.setItem('tradingApp_trades', JSON.stringify(trades));
      localStorage.setItem('tradingApp_notes', JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [initialBalance, rate, numberOfTrades, timerDuration, trades, notes]);

  // --- TIMER OPTIONS ---
  const timerOptions = [
    { label: '5 সেকেন্ড', value: 5 },
    { label: '10 সেকেন্ড', value: 10 },
    { label: '15 সেকেন্ড', value: 15 },
    { label: '20 সেকেন্ড', value: 20 },
    { label: '30 সেকেন্ড', value: 30 },
    { label: '1 মিনিট', value: 60 },
    { label: '10 মিনিট', value: 600 },
  ];

  // --- CORE LOGIC ---
  const generateTrades = useCallback(() => {
    if (initialBalance <= 0 || numberOfTrades <= 0) {
      setTrades([]);
      setNotes([]);
      return;
    }
    const generatedTrades: Trade[] = [];
    let currentBalance = initialBalance;
    const growthRate = rate / 100;

    generatedTrades.push({
      tradeNumber: 0,
      startingBalance: initialBalance,
      change: 0,
      endingBalance: initialBalance,
    });

    for (let i = 1; i <= numberOfTrades; i++) {
      const startingBalance = currentBalance;
      const change = startingBalance * growthRate;
      const endingBalance = startingBalance + change;
      generatedTrades.push({
        tradeNumber: i,
        startingBalance,
        change,
        endingBalance,
      });
      currentBalance = endingBalance;
    }
    setTrades(generatedTrades);
    setNotes(Array(generatedTrades.length).fill(''));
    setUnlockedNotes(new Set()); // Reset unlocked notes on new calculation
  }, [initialBalance, rate, numberOfTrades]);

  // --- EFFECTS ---
  useEffect(() => {
    if (!showModal) return;

    if (countdown <= 0) {
        setShowModal(false);
        if (postTimerAction) {
            postTimerAction();
            setPostTimerAction(null);
        }
        return;
    }

    const timerId = setTimeout(() => {
        setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [showModal, countdown, postTimerAction]);

  // --- HANDLERS ---
  const handleNoteChange = useCallback((index: number, value: string) => {
    setNotes(prevNotes => {
        const newNotes = [...prevNotes];
        newNotes[index] = value;
        return newNotes;
    });
  }, []);
  
  const handleCalculateClick = () => {
    setPostTimerAction(() => generateTrades);
    setCountdown(timerDuration);
    setShowModal(true);
  };

  const handleFocusNote = useCallback((tradeNumber: number) => {
    if (unlockedNotes.has(tradeNumber)) {
        return;
    }
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }
    
    const action = () => {
        setUnlockedNotes(prev => new Set(prev).add(tradeNumber));
        document.getElementById(`note-input-${tradeNumber}`)?.focus();
    };
    
    setPostTimerAction(() => action);
    setCountdown(timerDuration);
    setShowModal(true);
  }, [unlockedNotes, timerDuration]);
  
  const handleDownloadPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    if (!jsPDF) {
        alert("PDF library is not loaded yet.");
        return;
    }
    const doc = new jsPDF();
    
    // NOTE: Custom font logic removed to fix crash from corrupted font file.
    // As a result, PDF text is in English to prevent garbled characters.
    
    doc.setFontSize(18);
    doc.text('Trading Growth Report', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Initial Balance: ${currencyFormatter.format(initialBalance)}`, 14, 32);
    doc.text(`Profit/Loss Rate: ${rate}%`, 14, 38);
    doc.text(`Final Balance: ${currencyFormatter.format(finalBalance)}`, 14, 44);
    
    const head = [['Trade No', 'Start Balance', `${rate >= 0 ? 'Profit' : 'Loss'}`, 'End Balance', 'Note']];
    const body = trades.map((trade, index) => [
        trade.tradeNumber === 0 ? 'Start' : trade.tradeNumber.toString(),
        trade.tradeNumber === 0 ? '-' : currencyFormatter.format(trade.startingBalance),
        trade.tradeNumber === 0 ? '-' : currencyFormatter.format(trade.change),
        currencyFormatter.format(trade.endingBalance),
        notes[index] || ''
    ]);

    (doc as any).autoTable({
        head: head,
        body: body,
        startY: 50,
        headStyles: {
            fillColor: [38, 50, 56],
            textColor: 240,
        },
        alternateRowStyles: {
            fillColor: [45, 58, 65]
        },
        styles: {
            cellPadding: 2,
            fontSize: 10,
        },
        didDrawPage: (data: any) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(10);
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
    });

    doc.save('trading-growth-report.pdf');
  };

  // --- RENDER LOGIC ---
  const finalBalance = trades[trades.length - 1]?.endingBalance ?? initialBalance;
  const totalChange = finalBalance - initialBalance;
  const isTotalProfit = totalChange >= 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 font-sans">
       {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 animate-fadeIn">
          <div className="bg-gray-800 p-8 rounded-2xl text-center shadow-2xl border border-gray-700 transform transition-transform duration-300 animate-scaleIn">
            <h2 className="text-2xl font-bold mb-3 text-cyan-300">নিজেকে শান্ত করুন</h2>
            <p className="text-gray-400 mb-6 max-w-sm">
              তুমি লাভ লস যেটা করো, নিজেকে ঠান্ডা করো। আবেগ নিয়ন্ত্রণে রাখুন।
            </p>
            <div className="text-6xl font-mono mb-8 text-white tabular-nums">
              {countdown}
            </div>
            <div className="mt-4">
              <label htmlFor="timer-duration" className="mr-3 text-gray-400">টাইমার সেট করুন:</label>
              <select 
                id="timer-duration" 
                value={timerDuration} 
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 text-white rounded-lg p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                {timerOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 pb-2">
            ট্রেডিং গ্রোথ ক্যালকুলেটর
          </h1>
          <p className="text-gray-400 mt-2">
            আপনার বিনিয়োগের বৃদ্ধি বা হ্রাস গণনা করুন
          </p>
        </header>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label htmlFor="initialBalance" className="block mb-2 text-sm font-medium text-gray-300">প্রাথমিক বিনিয়োগ ($)</label>
                <input 
                  type="number" 
                  id="initialBalance"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                  placeholder="100"
                />
              </div>
              <div>
                <label htmlFor="rate" className="block mb-2 text-sm font-medium text-gray-300">লাভ/লোকসান হার (%)</label>
                <input 
                  type="number" 
                  id="rate"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                  placeholder="30"
                />
              </div>
              <div>
                <label htmlFor="numberOfTrades" className="block mb-2 text-sm font-medium text-gray-300">ট্রেডের সংখ্যা</label>
                <input 
                  type="number" 
                  id="numberOfTrades"
                  value={numberOfTrades}
                  onChange={(e) => setNumberOfTrades(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                  placeholder="30"
                />
              </div>
              <button
                onClick={handleCalculateClick}
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-400 shadow-lg"
              >
                হিসাব করুন
              </button>
            </div>
          </div>
          
          {trades.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <SummaryCard 
                  title="প্রাথমিক বিনিয়োগ" 
                  value={currencyFormatter.format(initialBalance)}
                  icon={<DollarIcon className="w-6 h-6 text-blue-200" />}
                  colorClass="bg-blue-500/30"
                />
                <SummaryCard 
                  title={isTotalProfit ? "সর্বমোট লাভ" : "সর্বমোট লোকসান"}
                  value={currencyFormatter.format(totalChange)}
                  icon={isTotalProfit ? <ChartUpIcon className="w-6 h-6 text-green-200" /> : <ChartDownIcon className="w-6 h-6 text-red-200" />}
                  colorClass={isTotalProfit ? "bg-green-500/30" : "bg-red-500/30"}
                />
                <SummaryCard 
                  title="চূড়ান্ত ব্যালেন্স" 
                  value={currencyFormatter.format(finalBalance)}
                  icon={<TargetIcon className="w-6 h-6 text-cyan-200" />}
                  colorClass="bg-cyan-500/30"
                />
              </div>
          )}
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-center">ট্রেড নং</th>
                    <th scope="col" className="px-6 py-3">শুরুর ব্যালেন্স</th>
                    <th scope="col" className="px-6 py-3">{rate >= 0 ? 'লাভ' : 'লোকসান'} ({Math.abs(rate)}%)</th>
                    <th scope="col" className="px-6 py-3">শেষের ব্যালেন্স</th>
                    <th scope="col" className="px-6 py-3">নোট</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, index) => (
                    <TradeTableRow
                      key={trade.tradeNumber}
                      trade={trade}
                      note={notes[index] || ''}
                      onNoteChange={(note) => handleNoteChange(index, note)}
                      onFocusNote={handleFocusNote}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
           {trades.length > 0 && (
            <div className="mt-8 flex justify-center">
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300 shadow-lg"
                >
                    <DownloadIcon className="w-5 h-5" />
                    PDF ডাউনলোড করুন
                </button>
            </div>
           )}
        </main>
      </div>
    </div>
  );
};

export default App;
