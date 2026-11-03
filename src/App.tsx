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
  const [llmEndpoint, setLlmEndpoint] = useState('https://openrouter.ai/api/v1');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-4o-mini');

  // AI tool states
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [studyGoal, setStudyGoal] = useState('');
  const [studyPlan, setStudyPlan] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'assistant', content: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [timetableText, setTimetableText] = useState('');
  const [timetableImage, setTimetableImage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);


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


  // Timetable helpers
  const addClass = () => {
    const newClass: Class = {
      id: Date.now().toString(),
      day: 'Mon',
      time: '09:00',
      subject: '',
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
      subject: '',
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
      name: '',
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
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://engg-atlas.vercel.app',
          'X-Title': 'ATLAS ISE Mission Control'
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

  const normalizeDay = (raw: string) => {
    const s = raw.trim().toLowerCase();
    const map: Record<string, string> = {
      mon: 'Mon', monday: 'Mon', tue: 'Tue', tues: 'Tue', tuesday: 'Tue',
      wed: 'Wed', wednesday: 'Wed', thu: 'Thu', thur: 'Thu', thurs: 'Thu', thursday: 'Thu',
      fri: 'Fri', friday: 'Fri', sat: 'Sat', saturday: 'Sat'
    };
    return map[s] || map[s.slice(0, 3)] || 'Mon';
  };

  const normalizeTime = (raw: string) => {
    const s = raw.trim().toLowerCase();
    const ranged = s.match(/(\d{1,2})[:.](\d{2})\s*(am|pm)?/);
    if (ranged) {
      let h = parseInt(ranged[1], 10);
      const min = ranged[2];
      if (ranged[3] === 'pm' && h < 12) h += 12;
      if (ranged[3] === 'am' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${min}`;
    }
    const hourOnly = s.match(/(\d{1,2})\s*(am|pm)/);
    if (hourOnly) {
      let h = parseInt(hourOnly[1], 10);
      if (hourOnly[2] === 'pm' && h < 12) h += 12;
      if (hourOnly[2] === 'am' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:00`;
    }
    return '09:00';
  };

  const onTimetableFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setTimetableImage(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const importTimetable = async (mode: 'replace' | 'append') => {
    if (!apiKey) {
      alert('Set your OpenRouter key in Settings first');
      return;
    }
    if (!timetableText.trim() && !timetableImage) {
      alert('Paste timetable text or upload a photo');
      return;
    }
    setImporting(true);
    try {
      const instruction = `Extract every scheduled class from this college timetable.
Return ONLY a JSON array. No markdown.
Schema: [{"day":"Mon","time":"09:00","subject":"DBMS","room":"LH-01"}]
day must be Mon, Tue, Wed, Thu, Fri, or Sat.
time is the start time in 24-hour HH:MM.
If a cell has a time range, use the start time.
Skip lunch, break, free, and empty slots.
If room is missing, use an empty string.
Keep the subject name exactly as written.`;
      const imageModel = /gpt-4o|gemini|claude|vision/i.test(model) ? model : 'openai/gpt-4o-mini';
      const userContent = timetableImage
        ? [
            { type: 'text', text: instruction + (timetableText.trim() ? `\n\nExtra text:\n${timetableText}` : '') },
            { type: 'image_url', image_url: { url: timetableImage } }
          ]
        : instruction + `\n\nTimetable text:\n${timetableText}`;
      const res = await fetch(`${llmEndpoint.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://engg-atlas.vercel.app',
          'X-Title': 'ATLAS ISE Mission Control'
        },
        body: JSON.stringify({
          model: timetableImage ? imageModel : model,
          messages: [{ role: 'user', content: userContent }],
          temperature: 0,
          max_tokens: 2000
        })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const raw = String(data.choices?.[0]?.message?.content || '');
      const jsonText = raw.replace(/```json|```/g, '').trim();
      const start = jsonText.indexOf('[');
      const end = jsonText.lastIndexOf(']');
      if (start < 0 || end < 0) throw new Error('Could not read classes from the response');
      const parsed = JSON.parse(jsonText.slice(start, end + 1));
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('No classes found');
      const imported: Class[] = parsed.map((item: any, i: number) => ({
        id: `${Date.now()}-${i}`,
        day: normalizeDay(String(item.day || 'Mon')),
        time: normalizeTime(String(item.time || '09:00')),
        subject: String(item.subject || '').trim(),
        room: String(item.room || '').trim()
      })).filter(c => c.subject);
      if (imported.length === 0) throw new Error('No named classes found');
      setClasses(mode === 'append' ? [...classes, ...imported] : imported);
      alert(`Imported ${imported.length} classes. Check times and edit anything wrong.`);
    } catch (e: any) {
      alert('Import failed: ' + e.message);
    } finally {
      setImporting(false);
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
      { role: 'user', content: `Goal: ${studyGoal}. Current subjects: ${[...new Set([...classes.map(c => c.subject), ...courses.map(c => c.name)].filter(Boolean))].join(', ') || 'ISE/CSE subjects'}` }
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

            <div className="mission-card p-5 mb-6">
              <div className="text-xs text-[#00d4ff] mb-2">IMPORT TIMETABLE</div>
              <div className="text-xs text-[#555] mb-3">Paste text or upload a photo. Extraction uses the API key in Settings. Review the result before trusting it.</div>
              <textarea
                className="input w-full h-24 mb-3 font-sans"
                placeholder="Paste timetable text, or leave blank and upload a photo..."
                value={timetableText}
                onChange={e => setTimetableText(e.target.value)}
              />
              <div className="flex flex-wrap gap-3 items-center">
                <label className="btn cursor-pointer">
                  UPLOAD PHOTO
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) onTimetableFile(file);
                    }}
                  />
                </label>
                <button type="button" className="btn btn-primary" disabled={importing} onClick={() => importTimetable('replace')}>
                  {importing ? 'EXTRACTING...' : 'EXTRACT & REPLACE'}
                </button>
                <button type="button" className="btn" disabled={importing} onClick={() => importTimetable('append')}>
                  EXTRACT & ADD
                </button>
                {timetableImage && (
                  <button type="button" className="btn" onClick={() => setTimetableImage(null)}>CLEAR PHOTO</button>
                )}
              </div>
              {timetableImage && (
                <img src={timetableImage} alt="Timetable preview" className="mt-3 max-h-40 border border-[#1f252e]" />
              )}
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
                        <input className="input w-52" placeholder="Subject name" value={c.subject} onChange={e => updateClass(c.id, 'subject', e.target.value)} />
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
                        <input className="input w-44" placeholder="Subject name" value={a.subject} onChange={e => updateAssignment(a.id, 'subject', e.target.value)} />
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
                        <input className="input w-60" placeholder="Course name" value={c.name} onChange={e => updateCourse(c.id, 'name', e.target.value)} />
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
                  placeholder="https://openrouter.ai/api/v1"
                />
                <div className="text-xs mt-1 text-[#555]">OpenRouter: https://openrouter.ai/api/v1</div>
                <button
                  type="button"
                  className="btn mt-2"
                  onClick={() => {
                    setLlmEndpoint('https://openrouter.ai/api/v1');
                    setModel('openai/gpt-4o-mini');
                  }}
                >
                  USE OPENROUTER
                </button>
              </div>

              <div>
                <div className="text-xs text-[#00d4ff] mb-2">API KEY</div>
                <input 
                  type="password"
                  className="input w-full" 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                />
                <div className="text-xs mt-1 text-[#555]">Paste your OpenRouter key here. Saved only in this browser, never in GitHub.</div>
              </div>

              <div>
                <div className="text-xs text-[#00d4ff] mb-2">MODEL NAME</div>
                <input 
                  className="input w-full" 
                  value={model} 
                  onChange={e => setModel(e.target.value)}
                  placeholder="openai/gpt-4o-mini"
                />
                <div className="text-xs mt-1 text-[#555]">OpenRouter model id, e.g. openai/gpt-4o-mini or google/gemini-2.0-flash-001</div>
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

