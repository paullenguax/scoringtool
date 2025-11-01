import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import logo from "../assets/lenguax-logo.png";

const TRAINER_KEY = "d8a3b74ec6ab418d9edc1a8f9cd6b99d";

const InfoIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

// ICAO Level Descriptions
const ICAO_DESCRIPTIONS = {
  Pronunciation: {
    1: "Pre-elementary: Performs at a level below the Elementary level",
    2: "Elementary: Pronunciation, stress, rhythm, and intonation are heavily influenced by the first language or regional variation and usually interfere with ease of understanding",
    3: "Pre-operational: Pronunciation, stress, rhythm, and intonation are influenced by the first language or regional variation and frequently interfere with ease of understanding",
    4: "Operational: Pronunciation, stress, rhythm, and intonation are influenced by the first language or regional variation but only sometimes interfere with ease of understanding",
    5: "Extended: Pronunciation, stress, rhythm, and intonation, though influenced by the first language or regional variation, rarely interfere with ease of understanding",
    6: "Expert: Pronunciation, stress, rhythm, and intonation, though possibly influenced by the first language or regional variation, almost never interfere with ease of understanding"
  },
  Structure: {
    1: "Pre-elementary: Performs at a level below the Elementary level",
    2: "Elementary: Shows only limited control of a few simple, memorized grammatical structures and sentence patterns",
    3: "Pre-operational: Basic grammatical structures and sentence patterns associated with predictable situations are not always well controlled. Errors frequently interfere with meaning",
    4: "Operational: Basic grammatical structures and sentence patterns are used creatively and are usually well controlled. Errors may occur, particularly in unusual or unexpected circumstances, but rarely interfere with meaning",
    5: "Extended: Basic grammatical structures and sentence patterns are consistently well controlled. Complex structures are attempted but with errors which sometimes interfere with meaning",
    6: "Expert: Both basic and complex grammatical structures and sentence patterns are consistently well controlled"
  },
  Vocabulary: {
    1: "Pre-elementary: Performs at a level below the Elementary level",
    2: "Elementary: Limited vocabulary range consisting only of isolated words and memorized phrases",
    3: "Pre-operational: Vocabulary range and accuracy are often sufficient to communicate on common, concrete, or work-related topics, but range is limited and the word choice often inappropriate. Is often unable to paraphrase successfully when lacking vocabulary",
    4: "Operational: Vocabulary range and accuracy are usually sufficient to communicate effectively on common, concrete, and work-related topics. Can often paraphrase successfully when lacking vocabulary in unusual or unexpected circumstances",
    5: "Extended: Vocabulary range and accuracy are sufficient to communicate effectively on common, concrete, and work-related topics. Paraphrases consistently and successfully. Vocabulary is sometimes idiomatic",
    6: "Expert: Vocabulary range and accuracy are sufficient to communicate effectively on a wide variety of familiar and unfamiliar topics. Vocabulary is idiomatic, nuanced, and sensitive to register"
  },
  Fluency: {
    1: "Pre-elementary: Performs at a level below the Elementary level",
    2: "Elementary: Can produce very short, isolated, memorized utterances with frequent pausing and a distracting use of fillers to search for expressions and to articulate less familiar words",
    3: "Pre-operational: Produces stretches of language, but phrasing and pausing are often inappropriate. Hesitations or slowness in language processing may prevent effective communication. Fillers are sometimes distracting",
    4: "Operational: Produces stretches of language at an appropriate tempo. There may be occasional loss of fluency on transition from rehearsed or formulaic speech to spontaneous interaction, but this does not prevent effective communication. Can make limited use of discourse markers or connectors. Fillers are not distracting",
    5: "Extended: Able to speak at length with relative ease on familiar topics but may not vary speech flow as a stylistic device. Can make use of appropriate discourse markers or connectors",
    6: "Expert: Able to speak at length with a natural, effortless flow. Varies speech flow for stylistic effect, e.g. to emphasize a point. Uses appropriate discourse markers and connectors spontaneously"
  },
  Comprehension: {
    1: "Pre-elementary: Performs at a level below the Elementary level",
    2: "Elementary: Comprehension is limited to isolated, memorized phrases when they are carefully and slowly articulated",
    3: "Pre-operational: Comprehension is often accurate on common, concrete, and work-related topics when the accent or variety used is sufficiently intelligible for an international community of users. May fail to understand a linguistic or situational complication or an unexpected turn of events",
    4: "Operational: Comprehension is mostly accurate on common, concrete, and work-related topics when the accent or variety used is sufficiently intelligible for an international community of users. When the speaker is confronted with a linguistic or situational complication or an unexpected turn of events, comprehension may be slower or require clarification strategies",
    5: "Extended: Comprehension is accurate on common, concrete, and work-related topics and mostly accurate when the speaker is confronted with a linguistic or situational complication or an unexpected turn of events. Is able to comprehend a range of speech varieties (dialect and/or accent) or registers",
    6: "Expert: Comprehension is consistently accurate in nearly all contexts and includes comprehension of linguistic and cultural subtleties"
  },
  Interactions: {
    1: "Pre-elementary: Performs at a level below the Elementary level",
    2: "Elementary: Response time is slow and often inappropriate. Interaction is limited to simple routine exchanges",
    3: "Pre-operational: Responses are sometimes immediate, appropriate, and informative. Can initiate and maintain exchanges with reasonable ease on familiar topics and in predictable situations. Generally inadequate when dealing with an unexpected turn of events",
    4: "Operational: Responses are usually immediate, appropriate, and informative. Initiates and maintains exchanges even when dealing with an unexpected turn of events. Deals adequately with apparent misunderstandings by checking, confirming, or clarifying",
    5: "Extended: Responses are immediate, appropriate, and informative. Manages the speaker/ listener relationship effectively",
    6: "Expert: Interacts with ease in nearly all situations. Is sensitive to verbal and non-verbal cues and responds to them appropriately"
  }
};

const Tooltip = ({ label, level }) => {
  const [show, setShow] = useState(false);
  const description = ICAO_DESCRIPTIONS[label]?.[level] || "No description available";
  
  return (
    <div className="relative inline-block ml-2">
      <div 
        className="text-gray-400 hover:text-brand-dark cursor-help transition-colors inline-flex"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <InfoIcon />
      </div>
      {show && (
        <div className="absolute z-50 w-64 sm:w-72 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg -top-2 left-6 pointer-events-none">
          <div className="font-semibold mb-1">Level {level} - {label}</div>
          {description}
          <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -left-1 top-3"></div>
        </div>
      )}
    </div>
  );
};

const getSliderColor = (value) => {
  if (value === 1) return "bg-red-700";
  if (value === 2) return "bg-red-500";
  if (value === 3) return "bg-red-400";
  if (value === 4) return "bg-green-400";
  if (value === 5) return "bg-green-500";
  return "bg-green-600";
};

const ScoreDistribution = ({ entries, criteriaIndex, label }) => {
  const scores = entries.map(e => e.scores[criteriaIndex]);
  const distribution = [1, 2, 3, 4, 5, 6].map(level => 
    scores.filter(s => s === level).length
  );
  const max = Math.max(...distribution, 1);
  
  const getBarColor = (level) => {
    if (level === 1) return "bg-red-700";
    if (level === 2) return "bg-red-500";
    if (level === 3) return "bg-red-400";
    if (level === 4) return "bg-green-400";
    if (level === 5) return "bg-green-500";
    return "bg-green-600";
  };
  
  return (
    <div className="mt-2">
      <div className="text-xs font-medium text-gray-600 mb-1">{label}</div>
      <div className="flex gap-1 items-end h-16 relative">
        {distribution.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative">
            {/* Count above the bar */}
            {count > 0 && (
              <div className="absolute top-0 text-xs font-bold text-gray-700">
                {count}
              </div>
            )}
            {/* Bar */}
            <div 
              className={`w-full ${getBarColor(i + 1)} rounded-t transition-all duration-300 flex items-center justify-center`}
              style={{ height: `${(count / max) * 75}%` }}
            >
              {/* Count inside bar if tall enough */}
              {count > 0 && (count / max) > 0.3 && (
                <span className="text-xs font-bold text-white opacity-90">{count}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Level labels clearly separated below */}
      <div className="flex gap-1 mt-1 border-t border-gray-200 pt-1">
        {[1, 2, 3, 4, 5, 6].map(level => (
          <div key={level} className="flex-1 text-center">
            <div className="text-xs font-semibold text-gray-600">L{level}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileScoreCard = ({ entry, index, isTrainer, showNames, onDelete }) => {
  const overall = Math.min(...entry.scores);
  
  return (
    <div className={`p-4 rounded-lg ${
      index % 2 === 0 ? "bg-white" : "bg-gray-50"
    } border border-gray-200`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          {isTrainer && showNames && entry.candidateId && (
            <div className="text-sm font-medium text-gray-700">
              Candidate: {entry.candidateId}
            </div>
          )}

          {isTrainer && showNames && (
            <div className="text-xs text-gray-500">
              {entry.raterName}
            </div>
          )}
          {isTrainer && !showNames && (
            <div className="text-xs text-gray-500">
              User {index + 1}
            </div>
          )}
          {isTrainer && showNames && (
            <div className="text-xs text-gray-400 mt-1">
              {new Date(entry.timestamp).toLocaleString()}
            </div>
          )}
          {!isTrainer && entry.candidateId && (
            <div className="text-sm text-gray-600">
              Candidate: {entry.candidateId}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Overall</div>
          <div className="text-2xl font-bold text-brand-dark">{overall}</div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-2">
        {entry.scores.map((score, idx) => (
          <span 
            key={idx}
            className={`inline-flex items-center justify-center w-8 h-8 rounded text-sm font-medium ${
              score === 1 ? 'bg-red-200 text-red-900' :
              score === 2 ? 'bg-red-100 text-red-800' :
              score === 3 ? 'bg-red-50 text-red-700' :
              score === 4 ? 'bg-green-50 text-green-700' :
              score === 5 ? 'bg-green-100 text-green-800' :
              'bg-green-200 text-green-900'
            }`}
          >
            {score}
          </span>
        ))}
      </div>
      
      {isTrainer && (
        <button
          onClick={() => onDelete(entry.id)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default function App() {
  const [candidateId, setCandidateId] = useState("");
  const [raterName, setRaterName] = useState("");
  const [scores, setScores] = useState(Array(6).fill(null));
  const [touched, setTouched] = useState(Array(6).fill(false));
  const [entries, setEntries] = useState([]);
  const [userId, setUserId] = useState("");
  const [showNames, setShowNames] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [showDistribution, setShowDistribution] = useState(false);
  const [allValid, setAllValid] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  // for multi-delete selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);


  const params = new URLSearchParams(window.location.search);
  const key = params.get("key");
  const isTrainer = key === TRAINER_KEY;

  const labels = [
    "Pronunciation",
    "Structure",
    "Vocabulary",
    "Fluency",
    "Comprehension",
    "Interactions",
  ];

  useEffect(() => {
    let id = localStorage.getItem("userId");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("userId", id);
    }
    setUserId(id);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "scores"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEntries(data.sort((a, b) => b.timestamp - a.timestamp));
    });
    return unsub;
  }, []);

  const handleSubmit = async () => {
    if (!raterName.trim()) return alert("Please enter your name.");

    if (scores.some(s => s === null)) {
      setShowErrors(true);
      alert("Please rate all criteria before submitting.");
      return;
    }

    await addDoc(collection(db, "scores"), {
      candidateId: candidateId.trim() || null,
      raterName: raterName.trim(),
      scores: scores,
      timestamp: Date.now(),
      userId,
    });

    setCandidateId("");
    setScores(Array(6).fill(null));
    setTouched(Array(6).fill(false));
    setShowErrors(false);
    setAllValid(true);
    setTimeout(() => setAllValid(false), 2000);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this entry?")) {
      await deleteDoc(doc(db, "scores", id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("No entries selected.");
      return;
    }

    if (window.confirm(`Delete ${selectedIds.length} selected entries?`)) {
      const deletions = selectedIds.map(id => deleteDoc(doc(db, "scores", id)));
      await Promise.all(deletions);
      setSelectedIds([]);
      setSelectAll(false);
    }
  };

  const handleClearLocal = () => {
    if (
      window.confirm(
        "This will clear your local session and allow you to resubmit. Continue?"
      )
    ) {
      localStorage.removeItem("userId");
      setScores(Array(6).fill(null));
      setTouched(Array(6).fill(false));
      setShowErrors(false);
      window.location.reload();
    }
  };

  const visibleEntries = isTrainer
    ? entries
    : entries.filter((e) => e.userId === userId);

  const handleDownloadCSV = () => {
    if (entries.length === 0) {
      alert("No data to download.");
      return;
    }

    const headers = [
      "Timestamp",
      "Candidate ID",
      "Rater Name",
      ...labels,
      "Overall"
    ];
    
    const rows = entries.map((e) => {
      const overall = Math.min(...e.scores);
      return [
        new Date(e.timestamp).toLocaleString(),
        e.candidateId || "",
        e.raterName || "",
        ...e.scores,
        overall
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((val) => `"${val}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `icao_scores_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const calculateAverages = () => {
    if (entries.length === 0) return Array(6).fill(0);
    const sums = Array(6).fill(0);
    entries.forEach(e => {
      e.scores.forEach((score, i) => {
        sums[i] += score;
      });
    });
    return sums.map(sum => (sum / entries.length).toFixed(1));
  };

  const calculateOverallDistribution = () => {
    if (entries.length === 0) return {};
    const overalls = entries.map(e => Math.min(...e.scores));
    const distribution = {};
    overalls.forEach(score => {
      distribution[score] = (distribution[score] || 0) + 1;
    });
    return distribution;
  };

  const averages = calculateAverages();
  const overallDist = calculateOverallDistribution();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center py-4 sm:py-8 px-4 font-sans">
      {isTrainer && (
        <div className="flex flex-wrap justify-center mb-4 sm:mb-6 gap-2 sm:gap-3 w-full max-w-3xl">
          <button
            onClick={() => setShowNames(!showNames)}
            className="px-3 sm:px-4 py-2 bg-white rounded-lg hover:bg-gray-50 text-xs sm:text-sm text-brand-dark font-medium shadow-sm"
          >
            {showNames ? "Hide Names" : "Show Names"}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 sm:px-4 py-2 bg-white rounded-lg hover:bg-gray-50 text-xs sm:text-sm text-brand-dark font-medium shadow-sm"
          >
            {showForm ? "Hide Form" : "Show Form"}
          </button>
          <button
            onClick={() => setShowDistribution(!showDistribution)}
            className="px-3 sm:px-4 py-2 bg-white rounded-lg hover:bg-gray-50 text-xs sm:text-sm text-brand-dark font-medium shadow-sm"
          >
            {showDistribution ? "Hide Stats" : "Show Stats"}
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium shadow-sm"
          >
            Download CSV
          </button>
          <button
            onClick={() => {
              if (!selectAll) {
                setSelectedIds(entries.map(e => e.id));
              } else {
                setSelectedIds([]);
              }
              setSelectAll(!selectAll);
            }}
            className="px-3 sm:px-4 py-2 bg-white rounded-lg hover:bg-gray-50 text-xs sm:text-sm text-brand-dark font-medium shadow-sm"
          >
            {selectAll ? "Deselect All" : "Select All"}
          </button>

          <button
            onClick={handleBulkDelete}
            className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm font-medium shadow-sm"
          >
            Delete Selected
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-8 w-full max-w-2xl mb-6 sm:mb-10 relative">
          <img
            src={logo}
            alt="Lenguax logo"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 object-contain"
          />

          <div className="relative pr-20">
            <h2 className="text-2xl font-bold text-center mb-2 text-brand-dark">
              Rater Course Scoring Tool
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Rate each candidate on all 6 criteria from 1–6
            </p>
          </div>

          <input
            placeholder="Candidate ID (optional)"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            placeholder="Your Name (required)"
            value={raterName}
            onChange={(e) => setRaterName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 mb-4 sm:mb-6 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="space-y-4 sm:space-y-6 mb-4 sm:mb-6">
            {labels.map((label, i) => (
              <div
                key={i}
                className={`border-2 rounded-lg p-3 sm:p-4 pb-6 sm:pb-7 transition-all ${
                  showErrors && !touched[i]
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center">
                    <label className="text-sm sm:text-base text-gray-700 font-medium">
                      {label}
                    </label>
                    {touched[i] && scores[i] !== null && (
                      <Tooltip label={label} level={scores[i]} />
                    )}
                  </div>

                  <div
                    className={`text-xl sm:text-2xl font-bold ${
                      !touched[i]
                        ? "text-gray-300"
                        : scores[i] <= 3
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {touched[i] && scores[i] !== null ? scores[i] : "—"}
                  </div>
                </div>

                {/* Slider + Number input */}
                <div className="relative">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={scores[i] || 4}
                      onChange={(e) => {
                        const newScores = [...scores];
                        newScores[i] = parseInt(e.target.value);
                        setScores(newScores);

                        const newTouched = [...touched];
                        newTouched[i] = true;
                        setTouched(newTouched);
                      }}
                      className="w-full h-2 rounded-lg cursor-pointer accent-blue-600"
                    />

                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={scores[i] || ""}
                      onChange={(e) => {
                        const val = Math.min(6, Math.max(1, parseInt(e.target.value) || 1));
                        const newScores = [...scores];
                        newScores[i] = val;
                        setScores(newScores);

                        const newTouched = [...touched];
                        newTouched[i] = true;
                        setTouched(newTouched);
                      }}
                      className="w-14 text-center border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-brand-dark"
                    />
                  </div>

                  {/* Scale labels */}
                  <div className="absolute left-0 right-[3.5rem] flex justify-between text-[10px] sm:text-xs text-gray-500 mt-1">
                    <span>Pre-elem</span>
                    <span className="hidden sm:inline">Elementary</span>
                    <span className="sm:hidden">Elem</span>
                    <span className="hidden sm:inline">Pre-op</span>
                    <span className="sm:hidden">P-op</span>
                    <span className="hidden sm:inline">Operational</span>
                    <span className="sm:hidden">Oper</span>
                    <span className="hidden sm:inline">Extended</span>
                    <span className="sm:hidden">Ext</span>
                    <span>Expert</span>
                  </div>
                </div>

                {/* Validation message */}
                {showErrors && !touched[i] && (
                  <p className="text-red-600 text-xs sm:text-sm mt-5">
                    ⚠ Please rate this criterion
                  </p>
                )}
              </div>
            ))}
          </div>

          {allValid && (
            <p className="text-green-700 text-sm mb-3 text-center font-medium animate-pulse">
              ✅ Submitted successfully!
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-base sm:text-lg transition-colors"
          >
            Submit Scores
          </button>

          {!isTrainer && (
            <button
              onClick={handleClearLocal}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors mt-3 text-xs sm:text-sm font-medium"
            >
              Reset Session
            </button>
          )}
        </div>
      )}

      {isTrainer && showDistribution && entries.length > 0 && (
        <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 w-full max-w-3xl mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-brand-dark text-center">
            Score Distribution ({entries.length} submissions)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {labels.map((label, i) => (
              <ScoreDistribution 
                key={i} 
                entries={entries} 
                criteriaIndex={i} 
                label={label}
              />
            ))}
          </div>
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-gray-700 mb-3">Overall Score Distribution</h4>
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4, 5, 6].map(level => (
                <div key={level} className="flex-1 text-center">
                  <div className={`text-xl sm:text-2xl font-bold ${
                    level <= 3 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {overallDist[level] || 0}
                  </div>
                  <div className="text-xs text-gray-600">L{level}</div>
                </div>
              ))}
            </div>
            
            <h4 className="font-semibold text-gray-700 mb-2">Average per Criterion</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {labels.map((label, i) => (
                <div key={i} className="bg-gray-50 rounded p-2 text-center">
                  <div className="text-xs text-gray-600">{label}</div>
                  <div className="text-base sm:text-lg font-bold text-brand-dark">{averages[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 w-full max-w-3xl">
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-brand-dark text-center">
          {isTrainer ? `All Submissions (${entries.length})` : "Your Submission"}
        </h3>

        {visibleEntries.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No scores submitted yet.</p>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left text-sm">
                    {isTrainer && (
                      <th className="p-3 border-b text-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={() => {
                            if (!selectAll) {
                              setSelectedIds(entries.map((e) => e.id));
                            } else {
                              setSelectedIds([]);
                            }
                            setSelectAll(!selectAll);
                          }}
                        />
                      </th>
                    )}

                    {isTrainer && showNames && <th className="p-3 border-b font-semibold">Time</th>}
                    {isTrainer && <th className="p-3 border-b font-semibold">Candidate</th>}
                    <th className="p-3 border-b font-semibold">Scores</th>
                    <th className="p-3 border-b font-semibold">Overall</th>
                    {isTrainer && showNames && <th className="p-3 border-b font-semibold">Rater</th>}
                    {isTrainer && <th className="p-3 border-b text-center font-semibold">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleEntries.map((e, i) => {
                    const overall = Math.min(...e.scores);
                    return (
                      <tr
                        key={e.id}
                        className={`${
                          selectedIds.includes(e.id)
                            ? "bg-blue-100"
                            : i % 2 === 0
                            ? "bg-white"
                            : "bg-gray-50"
                        } hover:bg-blue-50 transition-colors`}
                      >
                        {isTrainer && (
                          <td className="p-3 border-b text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(e.id)}
                              onChange={() => {
                                if (selectedIds.includes(e.id)) {
                                  setSelectedIds(selectedIds.filter((id) => id !== e.id));
                                } else {
                                  setSelectedIds([...selectedIds, e.id]);
                                }
                              }}
                            />
                          </td>
                        )}

                        {isTrainer && showNames && (
                          <td className="p-3 border-b text-xs text-gray-600">
                            {new Date(e.timestamp).toLocaleTimeString()}
                          </td>
                        )}
                        {isTrainer && (
                          <td className="p-3 border-b text-sm">
                            {showNames ? (e.candidateId || "—") : "—"}
                          </td>
                        )}
                        <td className="p-3 border-b">
                          <div className="flex gap-1">
                            {e.scores.map((score, idx) => (
                              <span 
                                key={idx}
                                className={`inline-flex items-center justify-center w-7 h-7 rounded text-sm font-medium ${
                                  score === 1 ? 'bg-red-200 text-red-900' :
                                  score === 2 ? 'bg-red-100 text-red-800' :
                                  score === 3 ? 'bg-red-50 text-red-700' :
                                  score === 4 ? 'bg-green-50 text-green-700' :
                                  score === 5 ? 'bg-green-100 text-green-800' :
                                  'bg-green-200 text-green-900'
                                }`}
                              >
                                {score}
                              </span>
                            ))}
                          </div>
                          {!isTrainer && e.candidateId && (
                            <span className="block text-xs text-gray-500 mt-2">
                              Candidate: {e.candidateId}
                            </span>
                          )}
                        </td>
                        <td className="p-3 border-b">
                          <span className="font-semibold text-brand-dark">{overall}</span>
                        </td>
                        {isTrainer && (
                          <>
                            {showNames && (
                              <td className="p-3 border-b text-sm">
                                {e.raterName}
                              </td>
                            )}
                            <td className="p-3 border-b text-center">
                              <button
                                onClick={() => handleDelete(e.id)}
                                className="text-red-600 hover:text-red-800 hover:underline text-sm font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {visibleEntries.map((e, i) => (
                <MobileScoreCard
                  key={e.id}
                  entry={e}
                  index={i}
                  isTrainer={isTrainer}
                  showNames={showNames}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {isTrainer && (
        <p className="text-gray-600 text-xs sm:text-sm mt-4 text-center px-4">
          Trainer mode • {showNames ? "Names visible" : "Names hidden"} • {showForm ? "Form shown" : "Form hidden"}
        </p>
      )}
    </div>
  );
}