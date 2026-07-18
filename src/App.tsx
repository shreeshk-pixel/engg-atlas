import { useState, useEffect } from 'react';
import { 
  Rocket, Calendar, ClipboardList, TrendingUp, Bot, Settings, 
  Plus, Trash2, Check, Target, BookOpen 
} from 'lucide-react';

interface Class {
  id: string;
  day: string;
  time: string;
  subject: string;
  room: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  due: string;
  done: boolean;
}

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

const SUBJECTS = [
  'Data Structures', 'Algorithms', 'Operating Systems', 'DBMS',
  'Computer Networks', 'Software Engg', 'AI & ML', 'Web Tech',
  'Theory of Computation', 'Compiler Design', 'Cloud Computing', 'Cyber Security'
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const GRADES = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];

const GRADE_POINTS: Record<string, number> = {
  S: 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0
};

// TEMPORARY: Probability & Statistics 5-Week Exam Tracker
// Remove this entire section after the exam is over.
interface PlanItem {
  text: string;
}

interface PlanDay {
  day: number;
  topics: PlanItem[];
  time: string;
}

interface WeekPlan {
  week: number;
  title: string;
  objective: string;
  days: PlanDay[];
}

const STATS_PLAN: WeekPlan[] = [
  {
    week: 1,
    title: "Correlation and Regression",
    objective: "Master curve fitting by least squares, Karl Pearson correlation, linear/multiple/partial regression for engineering data modeling.",
    days: [
      { day: 1, topics: [
        { text: "Introduction to Curve Fitting & Least Square Method" },
        { text: "Fitting straight line: y = a + bx" }
      ], time: "2 hours" },
      { day: 2, topics: [
        { text: "Fitting power curve: y = ax^b" },
        { text: "Fitting parabolic curve: y = a + bx + cx²" }
      ], time: "2 hours" },
      { day: 3, topics: [
        { text: "Karl Pearson Coefficient of Correlation" },
        { text: "Linear Regression – problems and interpretation" }
      ], time: "2.5 hours" },
      { day: 4, topics: [
        { text: "Multiple Correlation and Multiple Regression" },
        { text: "Solved problems on multiple regression" }
      ], time: "2 hours" },
      { day: 5, topics: [
        { text: "Partial Correlation and Partial Regression" },
        { text: "Mixed problems: correlation + regression" }
      ], time: "2 hours" },
      { day: 6, topics: [
        { text: "Practice Problems – Curve fitting & Correlation" },
        { text: "Previous Year Questions (Unit I)" }
      ], time: "2 hours" },
      { day: 7, topics: [
        { text: "Full Revision of Unit I concepts" },
        { text: "Self Assessment + Weekly Quiz" }
      ], time: "1.5 hours" }
    ]
  },
  {
    week: 2,
    title: "Random Variable",
    objective: "Revise basic probability to Bayes theorem. Master discrete/continuous random variables, PDF/CDF, expectations, and standard distributions with practical examples.",
    days: [
      { day: 1, topics: [
        { text: "Revision: Basic Probability + Conditional Probability" },
        { text: "Bayes Theorem (full)" }
      ], time: "2 hours" },
      { day: 2, topics: [
        { text: "Discrete Random Variable (DRV) & Continuous Random Variable (CRV)" },
        { text: "Probability Distribution Function (PDF) & Cumulative Distribution Function (CDF)" }
      ], time: "2 hours" },
      { day: 3, topics: [
        { text: "Expectations, Mean and Variance" },
        { text: "Properties and solved problems" }
      ], time: "2 hours" },
      { day: 4, topics: [
        { text: "Binomial Distribution – theory + problems" },
        { text: "Poisson Distribution – theory + problems" }
      ], time: "2.5 hours" },
      { day: 5, topics: [
        { text: "Exponential Distribution" },
        { text: "Normal Distribution + practical examples" }
      ], time: "2 hours" },
      { day: 6, topics: [
        { text: "Practice Problems on all distributions" },
        { text: "Previous Year Questions (Unit II)" }
      ], time: "2 hours" },
      { day: 7, topics: [
        { text: "Full Revision of Unit II" },
        { text: "Self Assessment + Weekly Quiz" }
      ], time: "1.5 hours" }
    ]
  },
  {
    week: 3,
    title: "Joint PDF and Stochastic Process",
    objective: "Understand joint and conditional PDFs, expectations & covariance. Learn classification of stochastic processes and master Markov chains.",
    days: [
      { day: 1, topics: [
        { text: "Discrete Multivariable Joint PDF" },
        { text: "Multivariable Conditional Joint PDF" }
      ], time: "2 hours" },
      { day: 2, topics: [
        { text: "Expectations: Mean, Variance and Covariance (joint)" },
        { text: "Solved problems on joint distributions" }
      ], time: "2 hours" },
      { day: 3, topics: [
        { text: "Definition and Classification of Stochastic Processes" },
        { text: "Discrete state & Discrete parameter stochastic processes" }
      ], time: "2 hours" },
      { day: 4, topics: [
        { text: "Unique Fixed Probability Vector" },
        { text: "Regular Stochastic Matrix & Transition Probability" }
      ], time: "2 hours" },
      { day: 5, topics: [
        { text: "Markov Chain – definition, properties & examples" },
        { text: "One-step & n-step transition probabilities" }
      ], time: "2.5 hours" },
      { day: 6, topics: [
        { text: "Practice Problems – Joint PDF + Markov Chains" },
        { text: "Previous Year Questions (Unit III)" }
      ], time: "2 hours" },
      { day: 7, topics: [
        { text: "Full Revision of Unit III" },
        { text: "Self Assessment + Weekly Quiz" }
      ], time: "1.5 hours" }
    ]
  },
  {
    week: 4,
    title: "Hypothesis Testing",
    objective: "Learn formulation of hypotheses, critical regions, sampling errors, significance levels. Perform tests for mean, variance and proportion.",
    days: [
      { day: 1, topics: [
        { text: "Null and Alternate Hypothesis" },
        { text: "Critical Region & Type I / Type II Errors" }
      ], time: "2 hours" },
      { day: 2, topics: [
        { text: "Sampling & Sampling Errors" },
        { text: "Level of Significance and Confidence Limits" }
      ], time: "2 hours" },
      { day: 3, topics: [
        { text: "Testing Hypothesis of Mean (large samples)" },
        { text: "Testing Hypothesis of Mean (small samples)" }
      ], time: "2.5 hours" },
      { day: 4, topics: [
        { text: "Testing Hypothesis of Variance" },
        { text: "Solved problems" }
      ], time: "2 hours" },
      { day: 5, topics: [
        { text: "Testing Hypothesis of Proportion" },
        { text: "Mixed hypothesis testing problems" }
      ], time: "2 hours" },
      { day: 6, topics: [
        { text: "Practice Problems – All hypothesis tests" },
        { text: "Previous Year Questions (Unit IV)" }
      ], time: "2 hours" },
      { day: 7, topics: [
        { text: "Full Revision of Unit IV" },
        { text: "Self Assessment + Weekly Quiz" }
      ], time: "1.5 hours" }
    ]
  },
  {
    week: 5,
    title: "Sampling Distribution",
    objective: "Understand sampling distributions, sampling distribution of means. Master t, chi-square and F distributions with significance tests for small & large samples.",
    days: [
      { day: 1, topics: [
        { text: "Introduction to Sampling Distribution" },
        { text: "Sampling Distribution of Means (theory)" }
      ], time: "2 hours" },
      { day: 2, topics: [
        { text: "Test of Significance for Large Samples" },
        { text: "Test of Significance for Small Samples" }
      ], time: "2 hours" },
      { day: 3, topics: [
        { text: "Student’s t-distribution – theory & applications" },
        { text: "Chi-square (χ²) distribution – theory & applications" }
      ], time: "2.5 hours" },
      { day: 4, topics: [
        { text: "F-distribution – theory and uses" },
        { text: "Comparison of t, χ² and F tests" }
      ], time: "2 hours" },
      { day: 5, topics: [
        { text: "Practical examples on all sampling distributions" },
        { text: "Integrated problems from Unit V" }
      ], time: "2 hours" },
      { day: 6, topics: [
        { text: "Practice Problems + PYQs (Unit V)" },
        { text: "Full syllabus mixed practice (Units I–V)" }
      ], time: "2.5 hours" },
      { day: 7, topics: [
        { text: "Complete Revision of all 5 Units" },
        { text: "Final Self Assessment + Full Mock Quiz" }
      ], time: "2 hours" }
    ]
  }
];

function App() {
  const [tab, setTab] = useState<'overview' | 'timetable' | 'assignments' | 'academics' | 'ai' | 'psplan' | 'settings'>('overview');

  // Data states
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // AI settings
  const [llmEndpoint, setLlmEndpoint] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');

  // AI tool states
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [studyGoal, setStudyGoal] = useState('');
  const [studyPlan, setStudyPlan] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // TEMPORARY PS Plan Tracker state
  const [psProgress, setPsProgress] = useState<Record<string, boolean>>({});

  // Load from localStorage
  useEffect(() => {
    const savedClasses = localStorage.getItem('ise_classes');
    if (savedClasses) setClasses(JSON.parse(savedClasses));
    
    const savedAssign = localStorage.getItem('ise_assignments');
    if (savedAssign) setAssignments(JSON.parse(savedAssign));
    
    const savedCourses = localStorage.getItem('ise_courses');
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    
    const savedEndpoint = localStorage.getItem('ise_llm_endpoint');
    if (savedEndpoint) setLlmEndpoint(savedEndpoint);
    
    const savedKey = localStorage.getItem('ise_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ise_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('ise_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('ise_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('ise_llm_endpoint', llmEndpoint);
  }, [llmEndpoint]);

  useEffect(() => {
    localStorage.setItem('ise_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('ise_llm_model', model);
  }, [model]);

  // TEMP PS Plan progress load/save
  useEffect(() => {
    const saved = localStorage.getItem('ps_plan_progress');
    if (saved) setPsProgress(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('ps_plan_progress', JSON.stringify(psProgress));
  }, [psProgress]);

  const togglePsItem = (key: string) => {
    setPsProgress(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getPsProgress = () => {
    let total = 0;
    let done = 0;
    STATS_PLAN.forEach(w => w.days.forEach(d => {
      d.topics.forEach((_, i) => {
        total++;
        if (psProgress[`w${w.week}-d${d.day}-${i}`]) done++;
      });
    }));
    return total > 0 ? Math.round((done / total) * 100) : 0;
  };
  const psPercent = getPsProgress();

  // Timetable helpers
  const addClass = () => {
    const newClass: Class = {
      id: Date.now().toString(),
      day: 'Mon',
      time: '09:00',
      subject: SUBJECTS[0],
      room: 'LH-01'
    };
    setClasses([...classes, newClass]);
  };

  const updateClass = (id: string, field: keyof Class, value: string) => {
    setClasses(classes.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  // Assignments helpers
  const addAssignment = () => {
    const newAssign: Assignment = {
      id: Date.now().toString(),
      title: 'New Assignment',
      subject: SUBJECTS[0],
      due: new Date(Date.now() + 7*86400000).toISOString().split('T')[0],
      done: false
    };
    setAssignments([...assignments, newAssign]);
  };

  const updateAssignment = (id: string, field: keyof Assignment, value: any) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const toggleAssignment = (id: string) => {
    setAssignments(assignments.map(a => a.id === id ? { ...a, done: !a.done } : a));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  // Academics / CGPA
  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: SUBJECTS[0],
      credits: 4,
      grade: 'A'
    };
    setCourses([...courses, newCourse]);
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const calculateCGPA = () => {
    if (courses.length === 0) return 0;
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach(c => {
      totalPoints += GRADE_POINTS[c.grade] * c.credits;
      totalCredits += c.credits;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  // AI calls - OpenAI compatible
  const callLLM = async (messages: any[]) => {
    if (!apiKey) {
      alert('Please set your API key in Settings');
      return null;
    }
    
    setAiLoading(true);
    try {
      const res = await fetch(`${llmEndpoint.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });
      
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'LLM request failed');
      }
      
      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No response';
    } catch (e: any) {
      alert('AI Error: ' + e.message);
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const summarizeNotes = async () => {
    if (!notes.trim()) return;
    const result = await callLLM([
      { role: 'system', content: 'You are a concise engineering student study assistant. Summarize lecture notes into key points, formulas, and important concepts for ISE/CSE exams.' },
      { role: 'user', content: notes }
    ]);
    if (result) setSummary(result);
  };

  const generateStudyPlan = async () => {
    if (!studyGoal.trim()) return;
    const result = await callLLM([
      { role: 'system', content: 'You are a mission control planner for engineering students. Create a realistic 7-day study plan for an ISE student. Include specific topics, daily targets, and revision slots. Keep it tight and actionable.' },
      { role: 'user', content: `Goal: ${studyGoal}. Current subjects: ${SUBJECTS.slice(0,6).join(', ')}` }
    ]);
    if (result) setStudyPlan(result);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user' as const, content: chatInput };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput('');

    const result = await callLLM([
      { role: 'system', content: 'You are ATLAS, an elite mission control AI for Information Science & Engineering students. Answer doubts clearly with examples, code snippets when relevant, and exam tips. Be direct.' },
      ...newMessages
    ]);
    
    if (result) {
      setChatMessages([...newMessages, { role: 'assistant', content: result }]);
    }
  };

  // Get upcoming assignments
  const upcoming = [...assignments]
    .filter(a => !a.done)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 4);

  // Get today classes
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todayClasses = classes.filter(c => c.day.startsWith(today.slice(0,3)));

  return (
    <div className="min-h-screen grid-bg text-[#a1a7b3] font-mono">
      {/* TOP BAR - SpaceX style */}
      <div className="border-b border-[#1f252e] bg-[#0a0c10]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Rocket className="w-6 h-6 text-[#00d4ff]" />
              <div>
                <div className="text-[#e6e9ef] text-xl tracking-[3px] font-semibold">ATLAS</div>
                <div className="text-[10px] text-[#00d4ff] -mt-1">MISSION CONTROL</div>
              </div>
            </div>
            <div className="ml-4 px-3 py-1 bg-[#111318] border border-[#1f252e] text-xs text-[#00d4ff]">
              ISE • 2026
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#111318] border border-[#1f252e]">
              <div className="status-dot animate-pulse" />
              NOMINAL
            </div>
            <div className="px-3 py-1 bg-[#111318] border border-[#1f252e] text-[#00d4ff]">
              {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="max-w-7xl mx-auto px-6 border-t border-[#1f252e] flex gap-1 overflow-x-auto">
           {[
             { id: 'overview', label: 'OVERVIEW', icon: Target },
             { id: 'timetable', label: 'TIMETABLE', icon: Calendar },
             { id: 'assignments', label: 'ASSIGNMENTS', icon: ClipboardList },
             { id: 'academics', label: 'ACADEMICS', icon: TrendingUp },
             { id: 'ai', label: 'AI OPS', icon: Bot },
             { id: 'psplan', label: 'STATS PLAN', icon: BookOpen },
             { id: 'settings', label: 'SETTINGS', icon: Settings },
           ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as any)}
              className={`nav-tab flex items-center gap-2 ${tab === id ? 'active' : ''}`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div>
            <div className="mb-8">
              <div className="text-[#00d4ff] text-xs tracking-[3px] mb-1">MISSION STATUS</div>
              <div className="text-4xl text-[#e6e9ef] tracking-tight">WELCOME BACK, CADET</div>
              <div className="text-sm mt-1">Information Science &amp; Engineering • Flight Control</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="mission-card p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs text-[#00d4ff]">CGPA</div>
                    <div className="text-4xl text-[#e6e9ef] mt-1">{calculateCGPA()}</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-[#00d4ff]/40" />
                </div>
                <div className="text-xs">{courses.length} courses tracked</div>
              </div>

              <div className="mission-card p-5">
                <div className="text-xs text-[#00d4ff] mb-1">TODAY'S CLASSES</div>
                {todayClasses.length > 0 ? (
                  todayClasses.map(c => (
                    <div key={c.id} className="text-sm py-1 border-b border-[#1f252e] last:border-0">
                      {c.time} • {c.subject} <span className="text-[#00d4ff]">• {c.room}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[#555]">No classes scheduled for today</div>
                )}
              </div>

              <div className="mission-card p-5">
                <div className="text-xs text-[#00d4ff] mb-2">UPCOMING ASSIGNMENTS</div>
                {upcoming.length > 0 ? upcoming.map(a => (
                  <div key={a.id} className="text-sm py-1 border-b border-[#1f252e] last:border-0 flex justify-between">
                    <span>{a.title}</span>
                    <span className="text-[#ff4d00]">{a.due}</span>
                  </div>
                )) : <div className="text-sm text-[#555]">All clear</div>}
              </div>
            </div>

            <div className="mission-card p-6">
              <div className="text-xs text-[#00d4ff] mb-3">QUICK ACTIONS</div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setTab('timetable')} className="btn">MANAGE TIMETABLE</button>
                <button onClick={() => setTab('assignments')} className="btn">ADD ASSIGNMENT</button>
                <button onClick={() => setTab('academics')} className="btn">UPDATE GRADES</button>
                <button onClick={() => setTab('ai')} className="btn btn-primary">LAUNCH AI OPS</button>
              </div>
            </div>
          </div>
        )}

        {/* TIMETABLE */}
        {tab === 'timetable' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-xs text-[#00d4ff]">FLIGHT SCHEDULE</div>
                <div className="text-3xl text-[#e6e9ef]">WEEKLY TIMETABLE</div>
              </div>
              <button onClick={addClass} className="btn btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> ADD CLASS
              </button>
            </div>

            <div className="mission-card overflow-hidden">
              <table>
                <thead>
                  <tr>
                    <th>DAY</th>
                    <th>TIME</th>
                    <th>SUBJECT</th>
                    <th>ROOM / HALL</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {classes.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-[#555]">No classes added. Click ADD CLASS.</td></tr>
                  )}
                  {classes.map(c => (
                    <tr key={c.id}>
                      <td>
                        <select className="input w-28" value={c.day} onChange={e => updateClass(c.id, 'day', e.target.value)}>
                          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </td>
                      <td><input type="time" className="input w-28" value={c.time} onChange={e => updateClass(c.id, 'time', e.target.value)} /></td>
                      <td>
                        <select className="input w-52" value={c.subject} onChange={e => updateClass(c.id, 'subject', e.target.value)}>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td><input className="input w-32" value={c.room} onChange={e => updateClass(c.id, 'room', e.target.value)} /></td>
                      <td><button onClick={() => deleteClass(c.id)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ASSIGNMENTS */}
        {tab === 'assignments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-xs text-[#00d4ff]">MISSION TASKS</div>
                <div className="text-3xl text-[#e6e9ef]">ASSIGNMENTS</div>
              </div>
              <button onClick={addAssignment} className="btn btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> NEW ASSIGNMENT
              </button>
            </div>

            <div className="mission-card overflow-hidden">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>TASK</th>
                    <th>SUBJECT</th>
                    <th>DUE DATE</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-[#555]">No assignments. Add one above.</td></tr>}
                  {assignments.map(a => (
                    <tr key={a.id} className={a.done ? 'opacity-50' : ''}>
                      <td>
                        <button onClick={() => toggleAssignment(a.id)} className={`w-5 h-5 border flex items-center justify-center ${a.done ? 'bg-[#00d4ff] border-[#00d4ff]' : 'border-[#1f252e]'}`}>
                          {a.done && <Check className="w-3 h-3 text-black" />}
                        </button>
                      </td>
                      <td><input className="input w-full" value={a.title} onChange={e => updateAssignment(a.id, 'title', e.target.value)} /></td>
                      <td>
                        <select className="input" value={a.subject} onChange={e => updateAssignment(a.id, 'subject', e.target.value)}>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td><input type="date" className="input" value={a.due} onChange={e => updateAssignment(a.id, 'due', e.target.value)} /></td>
                      <td><button onClick={() => deleteAssignment(a.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACADEMICS / CGPA */}
        {tab === 'academics' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-xs text-[#00d4ff]">PERFORMANCE TELEMETRY</div>
                <div className="text-3xl text-[#e6e9ef]">CGPA TRACKER</div>
              </div>
              <div className="text-right">
                <div className="text-[#00d4ff] text-xs">CURRENT CGPA</div>
                <div className="text-5xl text-[#e6e9ef] leading-none">{calculateCGPA()}</div>
              </div>
            </div>

            <div className="mission-card overflow-hidden mb-4">
              <table>
                <thead>
                  <tr>
                    <th>COURSE</th>
                    <th>CREDITS</th>
                    <th>GRADE</th>
                    <th>POINTS</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-[#555]">Add courses to calculate CGPA</td></tr>}
                  {courses.map(c => (
                    <tr key={c.id}>
                      <td>
                        <select className="input w-60" value={c.name} onChange={e => updateCourse(c.id, 'name', e.target.value)}>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td><input type="number" className="input w-20" value={c.credits} onChange={e => updateCourse(c.id, 'credits', parseInt(e.target.value) || 0)} /></td>
                      <td>
                        <select className="input w-20" value={c.grade} onChange={e => updateCourse(c.id, 'grade', e.target.value)}>
                          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </td>
                      <td className="text-[#e6e9ef]">{(GRADE_POINTS[c.grade] * c.credits).toFixed(1)}</td>
                      <td><button onClick={() => deleteCourse(c.id)} className="text-red-400"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addCourse} className="btn flex items-center gap-2"><Plus className="w-4 h-4" /> ADD COURSE</button>
          </div>
        )}

        {/* AI OPS */}
        {tab === 'ai' && (
          <div className="max-w-4xl">
            <div className="mb-8">
              <div className="text-xs text-[#00d4ff]">AI FLIGHT COMPUTER</div>
              <div className="text-3xl text-[#e6e9ef]">ATLAS INTELLIGENCE</div>
            </div>

            {/* Summarizer */}
            <div className="mission-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 text-[#00d4ff] text-sm">
                <Bot className="w-4 h-4" /> LECTURE NOTES SUMMARIZER
              </div>
              <textarea 
                className="input w-full h-32 mb-3 font-sans" 
                placeholder="Paste your lecture notes here..."
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
              />
              <button onClick={summarizeNotes} disabled={aiLoading} className="btn btn-primary">SUMMARIZE FOR EXAMS</button>
              {summary && (
                <div className="mt-4 p-4 bg-[#0a0c10] border border-[#1f252e] whitespace-pre-wrap text-sm leading-relaxed">{summary}</div>
              )}
            </div>

            {/* Study Plan */}
            <div className="mission-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4 text-[#00d4ff] text-sm">
                <Target className="w-4 h-4" /> STUDY PLAN GENERATOR
              </div>
              <input 
                className="input w-full mb-3" 
                placeholder="e.g. Ace DBMS + OS midsem in 10 days"
                value={studyGoal} 
                onChange={e => setStudyGoal(e.target.value)} 
              />
              <button onClick={generateStudyPlan} disabled={aiLoading} className="btn btn-primary">GENERATE 7-DAY PLAN</button>
              {studyPlan && (
                <div className="mt-4 p-4 bg-[#0a0c10] border border-[#1f252e] whitespace-pre-wrap text-sm leading-relaxed">{studyPlan}</div>
              )}
            </div>

            {/* Doubt Chat */}
            <div className="mission-card p-6">
              <div className="flex items-center gap-2 mb-4 text-[#00d4ff] text-sm">
                <Bot className="w-4 h-4" /> DOUBT-SOLVING CHAT — ASK ANYTHING
              </div>
              
              <div className="bg-[#0a0c10] border border-[#1f252e] h-72 overflow-y-auto p-4 mb-3 space-y-3 text-sm">
                {chatMessages.length === 0 && (
                  <div className="text-[#555] text-center mt-20">Ask about algorithms, OS concepts, DBMS queries, networks, etc.</div>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.role === 'user' ? 'chat-user' : 'chat-ai'}`}>
                    {m.content}
                  </div>
                ))}
                {aiLoading && <div className="text-[#00d4ff] text-xs">ATLAS IS THINKING...</div>}
              </div>

               <div className="flex gap-2">
                 <input 
                   className="input flex-1" 
                   placeholder="Type your doubt..." 
                   value={chatInput} 
                   onChange={e => setChatInput(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && sendChat()}
                 />
                 <button onClick={sendChat} disabled={aiLoading} className="btn btn-primary">SEND</button>
               </div>
             </div>
           </div>
         )}

         {/* TEMPORARY PROBABILITY & STATISTICS 5-WEEK TRACKER */}
         {tab === 'psplan' && (
           <div>
             <div className="mb-6">
               <div className="flex items-center gap-3">
                 <div className="text-xs text-[#ff4d00] px-2 py-1 bg-[#1f252e] border border-[#ff4d00]/40">TEMPORARY — REMOVE AFTER EXAM</div>
                 <div>
                   <div className="text-xs text-[#00d4ff]">PROBABILITY &amp; STATISTICS</div>
                   <div className="text-3xl text-[#e6e9ef]">5-WEEK EXAM TRACKER</div>
                 </div>
               </div>
             </div>

             <div className="mission-card p-5 mb-6">
               <div className="flex justify-between items-center mb-2">
                 <div className="text-xs text-[#00d4ff]">OVERALL PROGRESS</div>
                 <div className="text-[#e6e9ef] text-xl font-semibold">{psPercent}%</div>
               </div>
               <div className="h-2 bg-[#1f252e] rounded overflow-hidden">
                 <div className="h-2 bg-[#00d4ff]" style={{ width: `${psPercent}%` }} />
               </div>
               <div className="text-xs text-[#555] mt-1">Check off topics as you complete them. Progress saved locally.</div>
             </div>

             {STATS_PLAN.map(week => (
               <div key={week.week} className="mission-card p-6 mb-6">
                 <div className="mb-4">
                   <div className="text-[#00d4ff] text-xs tracking-widest">WEEK {week.week}</div>
                   <div className="text-2xl text-[#e6e9ef]">{week.title}</div>
                 </div>
                 <div className="mb-5 text-sm text-[#a1a7b3]">
                   <span className="text-[#00d4ff]">Objective:</span> {week.objective}
                 </div>

                 {week.days.map(day => (
                   <div key={day.day} className="mb-5 border-l-2 border-[#1f252e] pl-4">
                     <div className="flex items-center gap-2 mb-1">
                       <div className="text-[#e6e9ef] font-semibold">Day {day.day}</div>
                       <div className="text-xs text-[#555]">• {day.time}</div>
                     </div>
                     {day.topics.map((topic, idx) => {
                       const key = `w${week.week}-d${day.day}-${idx}`;
                       const checked = !!psProgress[key];
                       return (
                         <label key={idx} className="flex items-start gap-2 py-0.5 cursor-pointer text-sm">
                           <input
                             type="checkbox"
                             checked={checked}
                             onChange={() => togglePsItem(key)}
                             className="mt-1 accent-[#00d4ff]"
                           />
                           <span className={checked ? 'line-through opacity-60' : ''}>{topic.text}</span>
                         </label>
                       );
                     })}
                   </div>
                 ))}
               </div>
             ))}

             <div className="text-xs text-[#555] mt-2">
               Temporary tracker built for this exam only. Delete the entire "STATS PLAN" section once the exam is over.
             </div>
           </div>
         )}

         {/* SETTINGS */}
         {tab === 'settings' && (
          <div className="max-w-2xl">
            <div className="mb-8">
              <div className="text-xs text-[#00d4ff]">SYSTEM CONFIG</div>
              <div className="text-3xl text-[#e6e9ef]">SETTINGS</div>
            </div>

            <div className="mission-card p-6 space-y-6">
              <div>
                <div className="text-xs text-[#00d4ff] mb-2">LLM BASE URL</div>
                <input 
                  className="input w-full" 
                  value={llmEndpoint} 
                  onChange={e => setLlmEndpoint(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                />
                <div className="text-xs mt-1 text-[#555]">Use your Emergent endpoint or any OpenAI-compatible server</div>
              </div>

              <div>
                <div className="text-xs text-[#00d4ff] mb-2">API KEY</div>
                <input 
                  type="password"
                  className="input w-full" 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <div className="text-xs mt-1 text-[#555]">Stored only in your browser localStorage</div>
              </div>

              <div>
                <div className="text-xs text-[#00d4ff] mb-2">MODEL NAME</div>
                <input 
                  className="input w-full" 
                  value={model} 
                  onChange={e => setModel(e.target.value)}
                  placeholder="gpt-4o-mini, grok-2, llama-3.1-70b, claude-3-5-sonnet-20241022, etc."
                />
                <div className="text-xs mt-1 text-[#555]">Any model your provider supports (OpenAI-compatible format)</div>
              </div>

              <div className="pt-4 border-t border-[#1f252e] text-xs text-[#555]">
                Data is saved locally. This is a personal single-user tool.
              </div>
            </div>

            <div className="mt-8 text-xs text-[#555]">
              ATLAS • Information Science &amp; Engineering • Built for one cadet.
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <div className="border-t border-[#1f252e] py-4 text-center text-[10px] text-[#555]">
        T- MINUS TO GRADUATION • ALL SYSTEMS GO
      </div>
    </div>
  );
}

export default App;
