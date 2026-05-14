import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Activity, MessageSquare, Zap, Send, TrendingUp, BarChart2, 
  HelpCircle, Heart, ChevronRight, Menu, X, List, ExternalLink, 
  Globe, ChevronDown, ChevronUp, MessageCircle, Info, Ticket, Share2, RefreshCcw
} from 'lucide-react';
import './App.css';

const API_BASE_URL = '/api';

const TRANSLATIONS = {
  en: {
    hero: "HAALA BOL! 🏏",
    heroSub: "Experience the electric energy of IPL with real-time analytics, AI commentary, and fan engagement.",
    liveMatch: "Live Match Center",
    commentary: "Live Commentary",
    pointsTable: "IPL Points Table",
    quiz: "Test Your Cricket Knowledge",
    links: "Official Links",
    lang: "हिन्दी",
    navHome: "Home",
    navMatches: "Matches",
    navTable: "Table",
    navQuiz: "Quiz"
  },
  hi: {
    hero: "हल्ला बोल! 🏏",
    heroSub: "रीयल-टाइम एनालिटिक्स, एआई कमेंट्री और प्रशंसक जुड़ाव के साथ आईपीएल की इलेक्ट्रिक ऊर्जा का अनुभव करें।",
    liveMatch: "लाइव मैच सेंटर",
    commentary: "लाइव कमेंट्री",
    pointsTable: "IPL अंक तालिका",
    quiz: "अपने क्रिकेट ज्ञान का परीक्षण करें",
    links: "आधिकारिक लिंक",
    lang: "English",
    navHome: "मुख्य",
    navMatches: "मैच",
    navTable: "तालिका",
    navQuiz: "क्विज"
  }
};

const TEAM_LINKS = [
  { name: "IPL Official", url: "https://www.iplt20.com", color: "#004BA0", team: "MI" },
  { name: "BCCI", url: "https://www.bcci.tv", color: "#FFFF00", textColor: "black", team: "CSK" },
  { name: "ESPN Cricinfo", url: "https://www.espncricinfo.com", color: "#CC0000", team: "RCB" },
  { name: "Cricbuzz", url: "https://www.cricbuzz.com", color: "#3A225D", team: "KKR" },
  { name: "Fantasy Cricket", url: "https://www.dream11.com", color: "#FF822E", team: "SRH" },
  { name: "IPL Tickets", url: "https://www.iplt20.com/tickets", color: "#EA1B85", team: "RR" },
  { name: "Stats Guru", url: "#", color: "#B7AD8D", team: "PBKS" },
  { name: "Schedule", url: "#", color: "#00008B", team: "DC" }
];

const QUIZ_POOL = [
  { q: "Who won the first ever IPL in 2008?", a: ["RR", "CSK", "MI", "KKR"], c: "RR" },
  { q: "Which player has the most centuries in IPL history?", a: ["Virat Kohli", "Chris Gayle", "Jos Buttler", "David Warner"], c: "Virat Kohli" },
  { q: "Who was the captain of MI in 2024?", a: ["Hardik Pandya", "Rohit Sharma", "Suryakumar Yadav", "Jasprit Bumrah"], c: "Hardik Pandya" },
  { q: "Which team has won the most IPL titles?", a: ["MI & CSK", "KKR", "RCB", "SRH"], c: "MI & CSK" },
  { q: "Who bowled the first ball in IPL 2008?", a: ["Praveen Kumar", "Glenn McGrath", "Shane Warne", "Zaheer Khan"], c: "Praveen Kumar" },
  { q: "Brendon McCullum's 158* was against which team?", a: ["RCB", "CSK", "MI", "RR"], c: "RCB" },
  { q: "Who was the Orange Cap winner in 2023?", a: ["Shubman Gill", "Faf du Plessis", "Virat Kohli", "Yashasvi Jaiswal"], c: "Shubman Gill" },
  { q: "What is the maximum number of overseas players allowed in playing XI?", a: ["4", "3", "5", "2"], c: "4" },
  { q: "Which ground is known as 'The Gabbatoir'?", a: ["The Gabba", "Wankhede", "Eden Gardens", "MCG"], c: "The Gabba" },
  { q: "Who is known as 'Mr. IPL'?", a: ["Suresh Raina", "MS Dhoni", "Virat Kohli", "Chris Gayle"], c: "Suresh Raina" }
];

function App() {
  const [lang, setLang] = useState('en');
  const [liveMatches, setLiveMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scorecard, setScorecard] = useState(null);
  const [pointsTable, setPointsTable] = useState([]);
  const [commentary, setCommentary] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [showScorecard, setShowScorecard] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [matchEvent, setMatchEvent] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const t = TRANSLATIONS[lang];

  const shuffleQuiz = useCallback(() => {
    const shuffled = [...QUIZ_POOL].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, 5));
    setQuizIdx(0);
    setQuizScore(0);
    setQuizFinished(false);
    setQuizFeedback(null);
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchLiveScores();
      await fetchPointsTable();
      shuffleQuiz();
      setInitialized(true);
    };
    init();
    
    const scoreInterval = setInterval(fetchLiveScores, 15000);
    const commInterval = setInterval(() => {
      if (selectedMatch) fetchScorecard(selectedMatch.id);
    }, 30000);

    return () => {
      clearInterval(scoreInterval);
      clearInterval(commInterval);
    };
  }, [selectedMatch, shuffleQuiz]);

  const fetchLiveScores = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/live-scores`);
      const data = Array.isArray(res.data) ? res.data : [];
      setLiveMatches(data);
      if (data.length > 0 && !selectedMatch) {
        setSelectedMatch(data[0]);
        fetchScorecard(data[0].id);
      }
    } catch (err) {
      console.error("Failed scores:", err);
    }
  };

  const fetchScorecard = async (id) => {
    if (!id) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/match-scorecard/${id}`);
      setScorecard(res.data);
      const types = ["normal", "boundary", "wicket"];
      const newComm = [
        { over: (15 + Math.random()).toFixed(1), text: `Live update at ${new Date().toLocaleTimeString()}: The stadium atmosphere is incredible!`, type: types[Math.floor(Math.random() * 3)] },
        ...commentary.slice(0, 4)
      ];
      setCommentary(newComm);
    } catch (err) {
      console.error("Failed scorecard:", err);
    }
  };

  const fetchPointsTable = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/points-table`);
      setPointsTable(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed table:", err);
    }
  };

  const processEvent = async (customEvent = null) => {
    const eventText = customEvent || matchEvent;
    if (!eventText) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/process-event`, { event_text: eventText });
      const data = res.data;
      setAiResponse(data);
      setHistory(prev => [data, ...prev]);
      if (!chatOpen) setChatOpen(true);
    } catch (err) {
      console.error("AI Hub Error:", err);
    } finally {
      setLoading(false);
      setMatchEvent('');
    }
  };

  const handleQuizAnswer = (ans) => {
    if (quizFeedback) return;
    const isCorrect = ans === quizQuestions[quizIdx].c;
    if (isCorrect) setQuizScore(s => s + 1);
    setQuizFeedback({ selected: ans, correct: isCorrect });
    
    setTimeout(() => {
      setQuizFeedback(null);
      if (quizIdx + 1 < 5) {
        setQuizIdx(quizIdx + 1);
      } else {
        setQuizFinished(true);
      }
    }, 1500);
  };

  if (!initialized) {
    return <div className="animate-fade" style={{ background: '#0A0A0A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF6200', fontSize: '3rem', fontWeight: 900 }}>HAALA BOL! 🏏</div>;
  }

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="nav-logo"><Activity color="var(--ipl-orange)" /> CRICKETPULSE AI</div>
        <div className="nav-links">
          <a href="#matches">{t.navMatches}</a>
          <a href="#table">{t.navTable}</a>
          <a href="#quiz">{t.navQuiz}</a>
          <button className="lang-toggle" onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={{ position: 'static' }}>{t.lang}</button>
        </div>
      </nav>

      <header className="hero-header">
        <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="hero-title">{t.hero}</motion.h1>
        <p className="hero-subtitle">{t.heroSub}</p>
        <div className="ticker-wrap">
          <div className="ticker-move">
            {liveMatches.length > 0 ? liveMatches.map((m, i) => (
              <span key={i} className="ticker-item">{m.name} • {m.status} • </span>
            )) : <span className="ticker-item">LIVE IPL ACTION COMING UP • STAY TUNED FOR REAL-TIME UPDATES • </span>}
          </div>
        </div>
      </header>

      <main className="container" id="matches">
        <h2 className="section-title">{t.liveMatch}</h2>
        <div className="match-center-grid">
          <div className="card">
            {selectedMatch ? (
              <>
                <div className="score-display">
                  <div className="team-info">
                    <div className="team-name">{(selectedMatch.name || '').split(' vs ')[0]}</div>
                    <div className="team-score">
                      {selectedMatch.score?.[0]?.r || 0}/{selectedMatch.score?.[0]?.w || 0}
                      <small>({selectedMatch.score?.[0]?.o || 0})</small>
                    </div>
                  </div>
                  <div className="vs-badge">VS</div>
                  <div className="team-info" style={{ textAlign: 'right' }}>
                    <div className="team-name">{(selectedMatch.name || '').split(' vs ')[1]}</div>
                    <div className="team-score">
                      {selectedMatch.score?.[1]?.r || 0}/{selectedMatch.score?.[1]?.w || 0}
                      <small>({selectedMatch.score?.[1]?.o || 0})</small>
                    </div>
                  </div>
                </div>
                <div className="stats-grid">
                  <div className="stat-item"><span className="stat-label">On Strike</span><span className="stat-value">Virat Kohli 82* (50)</span></div>
                  <div className="stat-item"><span className="stat-label">Bowling</span><span className="stat-value">Mitchell Starc 2/35</span></div>
                </div>
                <div className="accordion">
                  <button className="accordion-trigger" onClick={() => setShowScorecard(!showScorecard)}>
                    <span>VIEW FULL SCORECARD</span>
                    {showScorecard ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  <AnimatePresence>
                    {showScorecard && scorecard && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="accordion-panel">
                        <div className="table-responsive">
                          <table className="data-table">
                            <thead><tr><th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead>
                            <tbody>
                              {(scorecard.scorecard?.[0]?.batting || []).map((b, i) => (
                                <tr key={i}><td>{b.name}</td><td>{b.r}</td><td>{b.b}</td><td>{b['4s']}</td><td>{b['6s']}</td><td>{b.sr}</td></tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : <p>Selecting live data...</p>}
          </div>

          <div className="card">
            <h3 className="card-subtitle">AI INTERACTION HUB</h3>
            <div className="ai-input-group">
              <input value={matchEvent} onChange={(e) => setMatchEvent(e.target.value)} placeholder="Ask Harsha AI about the match..." onKeyPress={(e) => e.key === 'Enter' && processEvent()} />
              <button className="ai-btn" onClick={() => processEvent()} disabled={loading}>{loading ? '...' : <Send size={20} />}</button>
            </div>
            <div className="ai-bubble">
              <AnimatePresence mode="wait">
                {loading ? <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>AI is analyzing match data...</motion.div> :
                 aiResponse ? <motion.div key="resp" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <span className="harsha-text">Harsha AI Analysis:</span>
                    <p style={{ fontSize: '1.1rem' }}>{aiResponse.commentary?.body || aiResponse.commentary?.headline || "The game is poised for a thriller!"}</p>
                  </motion.div> : <p>Awaiting match events or your insights...</p>}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div id="commentary" style={{ marginTop: 80 }}>
          <h2 className="section-title">{t.commentary}</h2>
          <div className="comm-list">
            {commentary.map((c, i) => (
              <div key={i} className="comm-row">
                <div className="comm-over">{c.over}</div>
                <div className={`comm-body ${c.type}`}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        <div id="table" style={{ marginTop: 80 }}>
          <h2 className="section-title">{t.pointsTable}</h2>
          <div className="card" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead><tr><th>Team</th><th>M</th><th>W</th><th>L</th><th>NRR</th><th>Pts</th><th>Form</th></tr></thead>
                <tbody>
                  {pointsTable.map((team, i) => (
                    <tr key={i} style={{ background: i < 4 ? 'rgba(255,215,0,0.05)' : 'transparent' }}>
                      <td><span style={{ width: 10, height: 10, borderRadius: '50%', background: i % 2 ? 'purple' : 'gold', display: 'inline-block', marginRight: 10 }}></span>{team.team}</td>
                      <td>{team.matches}</td><td>{team.wins}</td><td>{team.losses}</td><td>{team.nrr}</td><td>{team.pts}</td>
                      <td><div style={{ display: 'flex', gap: 5 }}>{(team.form || []).map((f, j) => (<span key={j} style={{ width: 18, height: 18, background: f === 'W' ? 'green' : 'red', borderRadius: 2, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f}</span>))}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div id="quiz" style={{ marginTop: 80 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>{t.quiz}</h2>
            <button className="ai-btn" onClick={shuffleQuiz} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><RefreshCcw size={18} /> New Set</button>
          </div>
          <div className="card" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            {!quizFinished && quizQuestions.length > 0 ? (
              <>
                <h3 className="card-subtitle">Question {quizIdx + 1}/5</h3>
                <p style={{ fontSize: '1.5rem', marginBottom: 30 }}>{quizQuestions[quizIdx].q}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {quizQuestions[quizIdx].a.map((o, i) => {
                    const isCorrect = o === quizQuestions[quizIdx].c;
                    const isSelected = quizFeedback?.selected === o;
                    let btnStyle = {};
                    if (quizFeedback) {
                      if (isCorrect) btnStyle = { background: '#00c853', color: 'white' };
                      else if (isSelected) btnStyle = { background: '#d50000', color: 'white' };
                    }
                    return (<button key={i} className="ai-btn" style={{ padding: 20, ...btnStyle }} onClick={() => handleQuizAnswer(o)}>{o}</button>);
                  })}
                </div>
                {quizFeedback && <div style={{ marginTop: 20, fontWeight: 900, color: quizFeedback.correct ? '#00c853' : '#d50000' }}>{quizFeedback.correct ? "CORRECT!" : "WRONG!"}</div>}
              </>
            ) : quizFinished ? (
              <div>
                <Trophy size={64} color="var(--ipl-gold)" />
                <h2 style={{ margin: '20px 0' }}>Quiz Complete!</h2>
                <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--ipl-orange)' }}>{quizScore}/5</div>
                <button className="ai-btn" style={{ marginTop: 30, padding: '15px 40px' }} onClick={shuffleQuiz}>TRY AGAIN</button>
              </div>
            ) : <p>Loading quiz...</p>}
          </div>
        </div>

        <div id="links" style={{ marginTop: 80 }}>
          <h2 className="section-title">{t.links}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
            {TEAM_LINKS.map(link => (
              <a 
                key={link.name} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="card" 
                style={{ 
                  textDecoration: 'none', 
                  textAlign: 'center', 
                  padding: 30, 
                  background: link.color, 
                  color: link.textColor || 'white', 
                  fontWeight: 900,
                  border: 'none',
                  boxShadow: `10px 10px 0px rgba(0,0,0,0.5)`,
                  transition: '0.3s'
                }}
              >
                <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: 5 }}>TEAM: {link.team}</div>
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </main>

      <footer className="main-footer">
        <div className="footer-logo">CRICKETPULSE AI</div>
        <div className="footer-links">
          <a href="#">About Us</a><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Contact</a>
        </div>
        <p style={{ opacity: 0.5 }}>© 2026 CricketPulse AI. Haala Bol Energy Reserved.</p>
      </footer>

      <div className="chat-widget-container" style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 3000 }}>
        <AnimatePresence>
          {chatOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="card" style={{ width: 350, height: 500, position: 'absolute', bottom: 80, right: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'var(--ipl-orange)', padding: 15, color: 'black', display: 'flex', justifyContent: 'space-between', fontWeight: 900 }}><span>AI ASSISTANT</span><X onClick={() => setChatOpen(false)} style={{ cursor: 'pointer' }} /></div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 15 }}>{history.length === 0 ? <p>How can I help you?</p> : history.slice().reverse().map((h, i) => (<div key={i} style={{ marginBottom: 15, padding: 10, background: 'rgba(255,255,255,0.05)' }}>{h.commentary?.body || "Analyzing..."}</div>))}</div>
              <div style={{ padding: 15, borderTop: '1px solid rgba(255,255,255,0.1)' }}><input value={matchEvent} onChange={e => setMatchEvent(e.target.value)} onKeyPress={e => e.key === 'Enter' && processEvent()} placeholder="Message..." style={{ width: '100%', background: '#000', border: '1px solid var(--ipl-orange)', padding: 10, color: 'white' }} /></div>
            </motion.div>
          )}
        </AnimatePresence>
        <div onClick={() => setChatOpen(!chatOpen)} style={{ background: 'var(--ipl-orange)', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 5px 20px rgba(255,98,0,0.4)' }}><MessageCircle color="white" size={30} /></div>
      </div>
    </div>
  );
}

export default App;
