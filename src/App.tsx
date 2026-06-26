import { useState, useEffect } from 'react';
import { 
  Rocket, Calendar, ClipboardList, TrendingUp, Bot, Settings, 
  Plus, Trash2, Check, Target 
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

function App() {
  const [tab, setTab] = useState<'overview' | 'timetable' | 'assignments' | 'academics' | 'ai' | 'settings'>('overview');

  // Data states
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // AI settings
  const [llmEndpoint, setLlmEndpoint] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');

  // AI tool states
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [studyGoal, setStudyGoal] = useState('');
  const [studyPlan, setStudyPlan] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

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
          model: 'gpt-4o-mini',
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
