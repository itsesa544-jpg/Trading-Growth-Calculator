import React, { useState, useEffect, useCallback, memo } from 'react';

// --- TYPE DEFINITIONS ---
interface Trade {
  tradeNumber: number;
  startingBalance: number;
  change: number; // Represents both profit and loss
  endingBalance: number;
}
type TradeStatus = 'profit' | 'loss' | null;

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

// --- IM SOFTWORKS MODAL COMPONENT ---
const IMSoftworksModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('about');

    const TabButton: React.FC<{ id: string, label: string }> = ({ id, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
                activeTab === id
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-200'
            }`}
        >
            {label}
        </button>
    );

    const content = {
        about: (
            <>
                <h3 className="text-2xl font-bold text-white mb-4">IM Softworks পরিচিতি</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">বাংলা:</h4>
                        <p>IM Softworks একটি উদীয়মান সফটওয়্যার কোম্পানি, যা ভবিষ্যতমুখী প্রযুক্তি ও সৃজনশীল সমাধানের মাধ্যমে ক্লায়েন্টদের ব্যবসায়িক সাফল্যে সহায়তা করে। আমরা বিশ্বাস করি— আমাদের উন্নতি তখনই সম্ভব, যখন আমাদের ক্লায়েন্ট লাভবান হবেন।</p>
                        <p className="mt-2 italic">আমরা শুধু সফটওয়্যার তৈরি করি না — আমরা সম্ভাবনা গড়ে তুলি।</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">English:</h4>
                        <p>IM Softworks is an emerging software company that empowers clients’ business success through futuristic technology and innovative solutions. We believe that our growth is only possible when our clients benefit.</p>
                        <p className="mt-2 italic">We don’t just build software — We build possibilities.</p>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-white mt-8 mb-4">🎯 আমাদের লক্ষ্য (Our Mission)</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">বাংলা:</h4>
                        <blockquote className="border-l-4 border-cyan-500 pl-4 italic">“আপনার লাভই আমাদের সফলতা।”</blockquote>
                        <p className="mt-2">আমরা প্রতিটি প্রজেক্টে বিশ্বাস করি— যদি ক্লায়েন্ট উপকৃত হন, তবেই আমরা সফল। সেই লক্ষ্যেই আমাদের প্রতিটি কোড, প্রতিটি ডিজাইন এবং প্রতিটি আইডিয়া।</p>
                    </div>
                     <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">English:</h4>
                        <blockquote className="border-l-4 border-cyan-500 pl-4 italic">“Your profit is our success.”</blockquote>
                        <p className="mt-2">In every project, we believe that our true achievement lies in the client’s benefit. That’s why every line of our code, every design, and every idea is driven by this mission.</p>
                    </div>
                </div>
            </>
        ),
        services: (
            <>
                <h3 className="text-2xl font-bold text-white mb-4">🔧 আমাদের সার্ভিসসমূহ (Our Services)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">বাংলা:</h4>
                        <ul className="list-disc list-inside space-y-2">
                            <li>কাস্টম সফটওয়্যার ডেভেলপমেন্ট</li>
                            <li>ওয়েব অ্যাপ্লিকেশন</li>
                            <li>মোবাইল অ্যাপ</li>
                            <li>ক্লাউড সল্যুশন</li>
                            <li>API ডেভেলপমেন্ট</li>
                            <li>UI/UX ডিজাইন</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">English:</h4>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Custom Software Development</li>
                            <li>Web Applications</li>
                            <li>Mobile Apps</li>
                            <li>Cloud Solutions</li>
                            <li>API Development</li>
                            <li>UI/UX Design</li>
                        </ul>
                    </div>
                </div>
                 <h3 className="text-2xl font-bold text-white mt-8 mb-4">🛠️ Products</h3>
                 <p>We develop smart, scalable, and future-ready software products tailored to meet the unique needs of modern businesses. Our products are designed to help you:</p>
                 <ul className="list-disc list-inside space-y-2 mt-4">
                    <li>Automate processes</li>
                    <li>Improve efficiency</li>
                    <li>Scale with confidence</li>
                 </ul>
            </>
        ),
        me: (
            <>
                <h3 className="text-2xl font-bold text-white mb-4">👋 আমার পরিচিতি (About Me)</h3>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <img src="https://res.cloudinary.com/dlklqihg6/image/upload/v1760308052/kkchmpjdp9izcjfvvo4k.jpg" alt="Mohammad Esa Ali" className="w-32 h-32 rounded-full object-cover border-4 border-gray-600 shadow-lg"/>
                    <div className="text-center sm:text-left">
                        <p className="font-bold text-xl text-white">Mohammad Esa Ali</p>
                        <p className="text-gray-400">Passionate and creative tech enthusiast.</p>
                        <p className="mt-2">I specialize in Software Development, Web Solutions, and Creative Design. My goal is to help businesses grow by building smart, future-ready, and user-friendly digital solutions.</p>
                        <div className="mt-4">
                            <h4 className="font-semibold text-cyan-400">💡 I believe:</h4>
                             <blockquote className="border-l-4 border-cyan-500 pl-4 italic mt-1">“Success comes when your clients succeed.”</blockquote>
                        </div>
                    </div>
                </div>
            </>
        ),
        contact: (
            <>
                <h3 className="text-2xl font-bold text-white mb-4">যোগাযোগ করুন (Contact Us)</h3>
                <p>Get in touch with us for collaborations, queries, or to start your next project.</p>
                <div className="mt-4">
                    <a href="mailto:im.softwark.team@gmail.com" className="text-cyan-400 hover:text-cyan-300 transition-colors break-all">
                        im.softwark.team@gmail.com
                    </a>
                </div>

                <h4 className="font-semibold text-white mt-8 mb-2">Useful Links</h4>
                <div className="flex flex-wrap gap-4">
                   <a href="#" className="text-gray-400 hover:text-white">Home</a>
                   <a href="#" className="text-gray-400 hover:text-white">About us</a>
                   <a href="#" className="text-gray-400 hover:text-white">Products</a>
                   <a href="#" className="text-gray-400 hover:text-white">Services</a>
                   <a href="#" className="text-gray-400 hover:text-white">Legal</a>
                </div>
            </>
        ),
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] flex flex-col animate-scaleIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">🌐 IM Softworks</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl font-light leading-none transition-colors">&times;</button>
                </div>
                
                <div className="border-b border-gray-700 px-2 sm:px-4 flex-shrink-0">
                    <nav className="flex flex-wrap -mb-px">
                        <TabButton id="about" label="আমাদের সম্পর্কে" />
                        <TabButton id="services" label="সার্ভিসসমূহ" />
                        <TabButton id="me" label="আমার পরিচিতি" />
                        <TabButton id="contact" label="যোগাযোগ" />
                    </nav>
                </div>

                <div className="p-6 overflow-y-auto text-gray-300">
                    {content[activeTab as keyof typeof content]}
                </div>
                
                <div className="p-3 mt-auto border-t border-gray-700 text-center text-xs text-gray-500 flex-shrink-0">
                    Copyright © IM Softworks
                </div>
            </div>
        </div>
    );
};


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
  status: TradeStatus;
  onStatusClick: (status: 'profit' | 'loss') => void;
}

const TradeTableRow: React.FC<TradeTableRowProps> = memo(({ trade, status, onStatusClick }) => {
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
        {trade.tradeNumber > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onStatusClick('profit')}
              className={`w-full text-sm font-semibold py-2 px-3 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                status === 'profit'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-600 text-gray-300 hover:bg-green-700'
              }`}
            >
              লাভ
            </button>
            <button
              onClick={() => onStatusClick('loss')}
              className={`w-full text-sm font-semibold py-2 px-3 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                status === 'loss'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-gray-600 text-gray-300 hover:bg-red-700'
              }`}
            >
              লস
            </button>
          </div>
        )}
      </td>
    </tr>
  );
});

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [initialBalance, setInitialBalance] = useState<number>(() => {
    const saved = localStorage.getItem('tradingApp_initialBalance');
    return saved ? JSON.parse(saved) : 100;
  });
  const [rate, setRate] = useState<number>(() => {
    const saved = localStorage.getItem('tradingApp_rate');
    return saved ? JSON.parse(saved) : 30;
  });
  const [calculationMode, setCalculationMode] = useState<'percentage' | 'fixed'>(() => {
    const saved = localStorage.getItem('tradingApp_calculationMode');
    return (saved === 'percentage' || saved === 'fixed') ? saved : 'percentage';
  });
  const [numberOfTrades, setNumberOfTrades] = useState<number>(() => {
    const saved = localStorage.getItem('tradingApp_numberOfTrades');
    return saved ? JSON.parse(saved) : 30;
  });
  const [trades, setTrades] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('tradingApp_trades');
    return saved ? JSON.parse(saved) : [];
  });
  const [tradeStatuses, setTradeStatuses] = useState<TradeStatus[]>(() => {
    const saved = localStorage.getItem('tradingApp_tradeStatuses');
    return saved ? JSON.parse(saved) : [];
  });
  const [timerDuration, setTimerDuration] = useState<number>(() => {
    const saved = localStorage.getItem('tradingApp_timerDuration');
    return saved ? JSON.parse(saved) : 10;
  });
  
  // UI state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [postTimerAction, setPostTimerAction] = useState<(() => void) | null>(null);
  const [unlockedTradesForStatus, setUnlockedTradesForStatus] = useState<Set<number>>(new Set());

  // --- LOCALSTORAGE PERSISTENCE ---
  useEffect(() => {
    try {
      localStorage.setItem('tradingApp_initialBalance', JSON.stringify(initialBalance));
      localStorage.setItem('tradingApp_rate', JSON.stringify(rate));
      localStorage.setItem('tradingApp_calculationMode', calculationMode);
      localStorage.setItem('tradingApp_numberOfTrades', JSON.stringify(numberOfTrades));
      localStorage.setItem('tradingApp_timerDuration', JSON.stringify(timerDuration));
      localStorage.setItem('tradingApp_trades', JSON.stringify(trades));
      localStorage.setItem('tradingApp_tradeStatuses', JSON.stringify(tradeStatuses));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [initialBalance, rate, calculationMode, numberOfTrades, timerDuration, trades, tradeStatuses]);

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
      setTradeStatuses([]);
      return;
    }
    const generatedTrades: Trade[] = [];
    let currentBalance = initialBalance;

    generatedTrades.push({
      tradeNumber: 0,
      startingBalance: initialBalance,
      change: 0,
      endingBalance: initialBalance,
    });

    for (let i = 1; i <= numberOfTrades; i++) {
      const startingBalance = currentBalance;
      const change = calculationMode === 'percentage' 
        ? startingBalance * (rate / 100) 
        : rate;
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
    setTradeStatuses(Array(generatedTrades.length).fill(null));
    setUnlockedTradesForStatus(new Set()); // Reset unlocked notes on new calculation
  }, [initialBalance, rate, numberOfTrades, calculationMode]);

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
  const handleStatusChange = useCallback((index: number, newStatus: 'profit' | 'loss') => {
    setTradeStatuses(prevStatuses => {
        const newStatuses = [...prevStatuses];
        newStatuses[index] = newStatuses[index] === newStatus ? null : newStatus;
        return newStatuses;
    });
  }, []);
  
  const handleCalculateClick = () => {
    setPostTimerAction(() => generateTrades);
    setCountdown(timerDuration);
    setShowModal(true);
  };

  const handleClickStatusButton = useCallback((index: number, status: 'profit' | 'loss') => {
    const tradeNumber = trades[index]?.tradeNumber;
    if (tradeNumber === undefined) return;

    if (unlockedTradesForStatus.has(tradeNumber)) {
        handleStatusChange(index, status);
        return;
    }
    
    const action = () => {
        setUnlockedTradesForStatus(prev => new Set(prev).add(tradeNumber));
        handleStatusChange(index, status);
    };
    
    setPostTimerAction(() => action);
    setCountdown(timerDuration);
    setShowModal(true);
  }, [unlockedTradesForStatus, timerDuration, trades, handleStatusChange]);
  
  const handleDownloadPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    if (!jsPDF) {
        alert("PDF library is not loaded yet.");
        return;
    }
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Trading Growth Report', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Initial Balance: ${currencyFormatter.format(initialBalance)}`, 14, 32);
    const rateText = calculationMode === 'percentage'
        ? `${rate}%`
        : `${currencyFormatter.format(rate)}`;
    doc.text(`Profit/Loss ${calculationMode === 'percentage' ? 'Rate' : 'Amount'}: ${rateText}`, 14, 38);
    doc.text(`Final Balance: ${currencyFormatter.format(finalBalance)}`, 14, 44);
    
    const headText = `${rate >= 0 ? 'Profit' : 'Loss'} (${calculationMode === 'percentage' ? '%' : '$'})`;
    const head = [['Trade No', 'Start Balance', headText, 'End Balance', 'স্ট্যাটাস']];
    const body = trades.map((trade, index) => [
        trade.tradeNumber === 0 ? 'Start' : trade.tradeNumber.toString(),
        trade.tradeNumber === 0 ? '-' : currencyFormatter.format(trade.startingBalance),
        trade.tradeNumber === 0 ? '-' : currencyFormatter.format(trade.change),
        currencyFormatter.format(trade.endingBalance),
        tradeStatuses[index] ? (tradeStatuses[index] === 'profit' ? 'লাভ' : 'লস') : ''
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
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 font-sans flex flex-col">
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
      {showInfoModal && <IMSoftworksModal onClose={() => setShowInfoModal(false)} />}
      <div className="max-w-7xl mx-auto w-full flex-grow">
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
                <label htmlFor="rate" className="flex justify-between items-center mb-2 text-sm font-medium text-gray-300">
                    <span>{calculationMode === 'percentage' ? 'লাভ/লোকসান হার' : 'লাভ/লোকসান পরিমাণ'}</span>
                    <div className="flex bg-gray-700 rounded-md p-0.5 border border-gray-600">
                        <button onClick={() => setCalculationMode('percentage')} className={`px-2 py-1 text-xs rounded-sm transition-colors ${calculationMode === 'percentage' ? 'bg-cyan-600 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-600'}`}>%</button>
                        <button onClick={() => setCalculationMode('fixed')} className={`px-2 py-1 text-xs rounded-sm transition-colors ${calculationMode === 'fixed' ? 'bg-cyan-600 text-white' : 'bg-transparent text-gray-300 hover:bg-gray-600'}`}>$</button>
                    </div>
                </label>
                <input 
                  type="number" 
                  id="rate"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5"
                  placeholder={calculationMode === 'percentage' ? "30" : "3"}
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
                    <th scope="col" className="px-6 py-3">{rate >= 0 ? 'লাভ' : 'লোকসান'} ({calculationMode === 'percentage' ? '%' : '$'})</th>
                    <th scope="col" className="px-6 py-3">শেষের ব্যালেন্স</th>
                    <th scope="col" className="px-6 py-3">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade, index) => (
                    <TradeTableRow
                      key={trade.tradeNumber}
                      trade={trade}
                      status={tradeStatuses[index] || null}
                      onStatusClick={(status) => handleClickStatusButton(index, status)}
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
       <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <span onClick={() => setShowInfoModal(true)} className="cursor-pointer hover:text-cyan-400 transition-colors">
            © IM Softworks
        </span>
      </footer>
    </div>
  );
};

export default App;