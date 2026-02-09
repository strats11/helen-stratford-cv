import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Cpu, 
  Code, 
  Database, 
  ArrowRight, 
  ChevronDown, 
  Mail, 
  Phone, 
  MapPin, 
  Layers,
  Sparkles,
  BookOpen,
  Download,
  Sun,
  Moon,
  GraduationCap
} from 'lucide-react';

// --- DATA ---
const DATA = {
  profile: {
    name: "Helen Stratford",
    role: "AI Solutions Manager",
    tagline: "Bridging the gap between Editorial Vision & Technical Execution.",
    location: "Walthamstow, London",
    email: "hstratford_10@yahoo.co.uk",
    phone: "078 121 57956",
    summary: "Senior Project Manager delivering technical transformation. Expert in translating commercial requirements into scalable solutions leveraging LLMs, automation (Zapier/Apps Script), and structured data to drive operational efficiency."
  },
  skills: {
    ai: [
      { name: "LLM Prompt Engineering", level: 90 },
      { name: "Workflow Automation (Zapier)", level: 95 },
      { name: "Google Apps Script", level: 85 },
      { name: "Rapid Prototyping", level: 90 },
      { name: "GEO/AEO - LLM Visibility", level: 80 },
      { name: "NotebookLM", level: 85 }
    ],
    web: [
      { name: "React.js Basics", level: 65 },
      { name: "JSON-LD / Schema.org", level: 85 },
      { name: "REST API / Webhooks", level: 65 },
      { name: "HTML5 / CSS3", level: 85 }
    ],
    product: [
      { name: "Agile Project Mgmt", level: 95 },
      { name: "Technical SEO Auditing", level: 85 },
      { name: "Google Analytics / Looker", level: 90 },
      { name: "Stakeholder Management", level: 95 }
    ]
  },
  experience: [
    {
      id: 1,
      company: "Pan Macmillan",
      role: "Senior Project Manager",
      period: "2019 – Present",
      highlight: "AI Strategy & Transformation",
      description: "Leading AI-augmented workflows and rapid prototyping to bridge editorial vision and technical execution.",
      achievements: [
        { title: "AI Strategy", desc: "Led the Web Technical Strategy, utilizing AI audits to identify bottlenecks." },
        { title: "GEO Optimisation", desc: "Implemented advanced schema for AI bot crawling, improving visibility in LLM responses." },
        { title: "Rapid Prototyping", desc: "Built an AI-augmented workflow using LLMs to generate React code for fast UI iterations." },
        { title: "Automation", desc: "Engineered automated solutions using Zapier & Google Apps Script to reduce admin overhead." }
      ]
    },
    {
      id: 2,
      company: "Bertram Group",
      role: "Head of Digital & Marketing",
      period: "2014 – 2019",
      highlight: "Product Roadmaps & Agile",
      description: "Developed commercial product roadmaps, bridging 'deep tech' capabilities and business goals.",
      achievements: [
        { title: "Agile Delivery", desc: "Led end-to-end delivery of large-scale platforms using Scrum/Agile." },
        { title: "Data Driven", desc: "Leveraged analytics to automate triggers, resulting in a 30% increase in spend." },
        { title: "Bridge Role", desc: "Acted as primary translator between commercial stakeholders and dev teams." }
      ]
    },
    {
      id: 3,
      company: "Dawson Books",
      role: "Senior Development Manager",
      period: "2010 – 2014",
      highlight: "Strategic Growth",
      description: "Managed multi-million pound development budget achieving 40% year-on-year growth.",
      achievements: [
        { title: "Market Leader", desc: "Defined product strategy for the #1 academic eBook platform." },
        { title: "Commercial Value", desc: "Secured top supplier status on Joint National Tender through platform innovation." }
      ]
    }
  ],
  education: [
    { year: "2015", title: "Certification in Digital Marketing", inst: "Google Squared" },
    { year: "2001", title: "Bachelor of Commerce (Info Mgmt)", inst: "Oxford Brookes / Damelin College" }
  ]
};

// --- COMPONENTS ---

const Navigation = ({ activeSection, scrollTo, isDark, toggleTheme }) => (
  <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
    <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
      <div 
        className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent cursor-pointer" 
        onClick={() => scrollTo('hero')}
      >
        HS.tech
      </div>
      <div className={`hidden md:flex space-x-8 text-sm font-medium transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {['Skills', 'Experience', 'Education', 'Contact'].map((item) => (
          <button 
            key={item}
            onClick={() => scrollTo(item.toLowerCase())}
            className={`hover:text-indigo-500 transition-colors ${activeSection === item.toLowerCase() ? (isDark ? 'text-white' : 'text-slate-900') : ''}`}
          >
            {item}
          </button>
        ))}
      </div>
      
      {/* THEME TOGGLE BUTTON */}
      <button 
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
          isDark 
            ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' 
            : 'bg-indigo-50 text-indigo-900 border-indigo-100 hover:bg-indigo-100'
        }`}
      >
        {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        {isDark ? "LIGHT MODE" : "DARK MODE"}
      </button>
    </div>
  </nav>
);

const TypewriterTerminal = () => {
  const segments = [
    { text: "Curious", bold: true },
    { text: " by nature. ", bold: false },
    { text: "Problem-solver", bold: true },
    { text: " by trade.\n\nI bridge the gap between business ambition and digital execution. I transform editorial vision into technical reality, specializing in ", bold: false },
    { text: "Web and AI Strategy", bold: true },
    { text: ", ", bold: false },
    { text: "Workflow Automation", bold: true },
    { text: ", and ", bold: false },
    { text: "Rapid Prototyping", bold: true },
    { text: " to build the future of publishing.", bold: false }
  ];

  const [charIndex, setCharIndex] = useState(0);
  
  useEffect(() => {
    let totalLength = segments.reduce((acc, seg) => acc + seg.text.length, 0);
    const interval = setInterval(() => {
      setCharIndex(prev => {
        if (prev < totalLength) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 20); // Slightly faster typing speed
    
    return () => clearInterval(interval);
  }, []);

  let renderedCount = 0;

  return (
    <div className="max-w-2xl mx-auto mb-10 w-full">
      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-2xl font-mono text-sm sm:text-base">
        <div className="bg-slate-800 px-4 py-2 flex items-center space-x-2 border-b border-slate-700">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="ml-2 text-xs text-slate-500">helen@portfolio ~</div>
        </div>
        <div className="p-4 text-left whitespace-pre-wrap leading-relaxed">
          <span className="text-green-400 mr-2">➜</span>
          <span className="text-indigo-300 mr-2">~</span>
          {segments.map((seg, i) => {
            const start = renderedCount;
            const len = seg.text.length;
            renderedCount += len;
            
            // Calculate how much of this segment to show
            const visibleLen = Math.max(0, Math.min(len, charIndex - start));
            
            if (visibleLen === 0) return null;
            
            return (
              <span 
                key={i} 
                className={seg.bold ? "font-bold text-white" : "text-slate-300"}
              >
                {seg.text.slice(0, visibleLen)}
              </span>
            );
          })}
          <span className="inline-block w-2.5 h-5 bg-slate-400 ml-1 align-middle animate-pulse"></span>
        </div>
      </div>
    </div>
  );
};

const ChatInterface = ({ isDark }) => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hello! I'm Helen's automated assistant. Ask me about her expertise." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleQuery = (query) => {
    setMessages(prev => [...prev, { type: 'user', text: query }]);
    setIsTyping(true);
    
    // Simulate AI delay
    setTimeout(() => {
      let response = "";
      switch(query) {
        case "Tell me about AI Strategy":
          response = "Helen currently leads AI-augmented workflows at Pan Macmillan. She implements Generative & Answer Engine Optimization (GEOAEO) to ensure content is visible to LLMs and uses AI for rapid prototyping.";
          break;
        case "Can she code?":
          response = "Yes. While primarily a Strategist/PM, Helen builds in React.js, manages REST APIs/Webhooks, and uses Google Apps Script & Zapier to engineer automated solutions.";
          break;
        case "What about Project Management?":
          response = "She has over 15 years of experience managing multi-million pound budgets, leading Agile/Scrum teams, and bridging the gap between editorial vision and technical execution.";
          break;
        default:
          response = "Helen is an expert in Digital Transformation, leveraging Data, AI, and Product Management to drive commercial value.";
      }
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
      setIsTyping(false);
    }, 1200);
  };

  const suggestions = [
    "Tell me about AI Strategy",
    "Can she code?",
    "What about Project Management?"
  ];

  return (
    <div className={`w-full max-w-2xl mx-auto rounded-2xl border overflow-hidden shadow-2xl mt-8 relative z-20 transition-colors duration-300 ${
      isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className={`px-4 py-3 border-b flex items-center space-x-2 ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className={`ml-2 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ai-agent-interface v1.0</span>
      </div>
      <div className="p-6 h-64 overflow-y-auto space-y-4 font-mono text-sm custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.type === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : (isDark ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200') + ' rounded-bl-none border'
            }`}>
              {msg.type === 'bot' && <Sparkles className={`w-3 h-3 inline mr-2 ${isDark ? 'text-yellow-400' : 'text-indigo-500'}`} />}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className={`p-3 rounded-lg rounded-bl-none border flex space-x-1 ${
               isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
             }`}>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
             </div>
          </div>
        )}
      </div>
      <div className={`p-4 border-t ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => handleQuery(s)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors border ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-900/50' 
                  : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-200 shadow-sm'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const SkillCard = ({ title, skills, icon: Icon, isDark }) => (
  <div className={`backdrop-blur-sm p-6 rounded-xl border transition-all duration-300 group ${
    isDark 
      ? 'bg-slate-900/50 border-slate-800 hover:border-indigo-500/50' 
      : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300'
  }`}>
    <div className="flex items-center mb-6">
      <div className={`p-2 rounded-lg mr-3 transition-colors ${
        isDark ? 'bg-indigo-500/10 group-hover:bg-indigo-500/20' : 'bg-indigo-50 group-hover:bg-indigo-100'
      }`}>
        <Icon className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
      </div>
      <h3 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{title}</h3>
    </div>
    <div className="space-y-4">
      {skills.map((skill, idx) => (
        <div key={idx} className="group/skill">
          <div className="flex justify-between text-sm mb-1">
            <span className={`transition-colors ${
              isDark ? 'text-slate-300 group-hover/skill:text-white' : 'text-slate-600 group-hover/skill:text-slate-900'
            }`}>{skill.name}</span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out group-hover/skill:bg-indigo-400"
              style={{ width: `${skill.level}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ExperienceItem = ({ job, isLast, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative pl-8 md:pl-0">
      {/* Desktop Timeline Line */}
      <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
      
      <div className={`md:flex items-center justify-between mb-12 ${!isLast ? '' : ''} group`}>
        {/* Date (Left on Desktop) */}
        <div className={`hidden md:block w-1/2 pr-12 text-right ${isOpen ? 'text-indigo-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
          <div className="font-mono text-sm font-bold tracking-wider">{job.period}</div>
          <div className={`text-2xl font-bold mt-1 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{job.company}</div>
        </div>

        {/* Center Dot */}
        <div className={`absolute left-0 md:left-1/2 -translate-x-1/2 top-0 w-4 h-4 rounded-full border-2 z-10 group-hover:scale-125 transition-transform ${
          isDark 
            ? 'bg-slate-900 border-indigo-500' 
            : 'bg-white border-indigo-500 shadow-sm'
        }`}></div>

        {/* Content (Right on Desktop) */}
        <div className="md:w-1/2 md:pl-12">
          {/* Mobile Header */}
          <div className="md:hidden mb-2">
             <span className="text-xs font-mono text-indigo-500 px-2 py-1 bg-indigo-500/10 rounded">{job.period}</span>
             <h3 className={`text-xl font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.company}</h3>
          </div>

          <div 
            className={`p-6 rounded-xl border transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-800/50 border-slate-700 hover:border-indigo-500/30' 
                : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md'
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className={`text-lg font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{job.role}</h4>
                <p className={`text-sm mt-1 italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{job.tagline}</p>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            
            <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {job.description}
            </p>

            <div className={`grid grid-cols-1 gap-3 mt-4 overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {job.achievements.map((ach, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-l-2 border-indigo-500 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                  <span className="block text-xs font-bold text-indigo-500 uppercase tracking-wide">{ach.title}</span>
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ach.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'skills', 'experience', 'education', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-500 selection:bg-indigo-500/30 ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>
      <Navigation activeSection={activeSection} scrollTo={scrollTo} isDark={isDark} toggleTheme={toggleTheme} />

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center overflow-hidden">
        
        {/* BACKGROUND IMAGE & OVERLAY */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80" 
            alt="AI Connection Background" 
            className="w-full h-full object-cover opacity-60"
          />
          {/* Theme-aware Overlay Gradients */}
          <div className={`absolute inset-0 bg-gradient-to-b transition-colors duration-700 ${
            isDark 
              ? 'from-slate-950/70 via-slate-950/70 to-slate-950' 
              : 'from-slate-50/80 via-slate-50/70 to-slate-50'
          }`}></div>
          <div className={`absolute inset-0 bg-gradient-to-r transition-colors duration-700 ${
            isDark 
              ? 'from-slate-950/80 via-transparent to-slate-950/80' 
              : 'from-slate-50/85 via-transparent to-slate-50/85'
          }`}></div>
        </div>

        {/* Existing Background Blobs (adjusted opacity) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-1"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] -z-1"></div>

        <div className="text-center max-w-4xl mx-auto z-10 relative">
          
          <h1 className={`text-5xl md:text-7xl font-bold tracking-tight mb-6 drop-shadow-xl transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Helen Stratford
          </h1>

          <TypewriterTerminal />
          
          <div className="flex justify-center mb-12">
            <button 
              onClick={() => scrollTo('experience')}
              className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
                isDark 
                  ? 'bg-white text-slate-900 hover:bg-slate-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              View Experience <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ChatInterface isDark={isDark} />
        </div>
        
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section id="skills" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-4 mb-12">
            <div className={`h-px flex-grow ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <h2 className={`text-3xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Cpu className="w-8 h-8 text-indigo-500" />
              Technical Arsenal
            </h2>
            <div className={`h-px flex-grow ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <SkillCard title="AI & Automation" skills={DATA.skills.ai} icon={Brain} isDark={isDark} />
            <SkillCard title="Web Development" skills={DATA.skills.web} icon={Code} isDark={isDark} />
            <SkillCard title="Data & Product" skills={DATA.skills.product} icon={Database} isDark={isDark} />
          </div>
          
          {/* Domain Expertise Banner */}
          <div className={`mt-12 p-8 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6 transition-colors ${
            isDark 
              ? 'bg-gradient-to-r from-slate-900 to-indigo-900/30 border-slate-700' 
              : 'bg-gradient-to-r from-white to-indigo-50 border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-4">
               <div className={`p-3 rounded-full ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                 <BookOpen className="w-6 h-6 text-indigo-500" />
               </div>
               <div>
                 <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Domain Expertise</h3>
                 <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Digital Publishing • Metadata Standards • Change Management</p>
               </div>
            </div>
            <div className="flex gap-3 flex-wrap justify-center md:justify-end">
              {['Stakeholder Management', 'Adoption Strategy', 'Agile/Scrum', 'Tech Strategy'].map((tag, i) => (
                <span key={i} className={`px-3 py-1 text-xs font-mono rounded-full border ${
                  isDark 
                    ? 'bg-slate-800 text-slate-300 border-slate-700' 
                    : 'bg-white text-slate-600 border-slate-200'
                }`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section id="experience" className={`py-24 px-6 transition-colors ${isDark ? 'bg-slate-900/30' : 'bg-slate-100/50'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold flex items-center justify-center gap-3 mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Layers className="w-8 h-8 text-indigo-500" />
              Professional Journey
            </h2>
            <p className={`max-w-2xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              A trajectory focused on operational efficiency, shifting from traditional Product Management to AI-driven Technical Strategy.
            </p>
          </div>

          <div className="space-y-4">
            {DATA.experience.map((job, idx) => (
              <ExperienceItem key={job.id} job={job} isLast={idx === DATA.experience.length - 1} isDark={isDark} />
            ))}
          </div>
        </div>
      </section>

      {/* EDUCATION SECTION */}
      <section id="education" className="py-24 px-6">
         <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold flex items-center justify-center gap-3 mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <GraduationCap className="w-8 h-8 text-indigo-500" />
                Education
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
               <div className={`p-8 rounded-2xl border relative overflow-hidden group transition-all ${
                 isDark 
                   ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' 
                   : 'bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md'
               }`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <h3 className="text-indigo-500 font-mono text-sm mb-2">2001</h3>
                  <h4 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Bachelor of Commerce</h4>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Oxford Brookes / Damelin College</p>
                  <p className={`text-sm mt-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Major in Information Management.</p>
               </div>
               
               <div className={`p-8 rounded-2xl border relative overflow-hidden group transition-all ${
                 isDark 
                   ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' 
                   : 'bg-white border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md'
               }`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <h3 className="text-indigo-500 font-mono text-sm mb-2">2015</h3>
                  <h4 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Certification in Digital Marketing</h4>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Google Squared</p>
                  <p className={`text-sm mt-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Advanced digital leadership and strategy program.</p>
               </div>
            </div>
         </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-24 px-6 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b pointer-events-none ${
          isDark ? 'from-transparent to-indigo-950/20' : 'from-transparent to-indigo-50/50'
        }`}></div>
        <div className={`max-w-3xl mx-auto rounded-3xl p-8 md:p-12 border shadow-2xl relative z-10 text-center transition-colors ${
          isDark 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>I'm ready for this role</h2>
          <p className={`mb-10 text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            The AI Solutions Manager role is perfect as it sits at the intersection of Product, AI, and Operational Strategy. 
          </p>

          <button className="inline-flex items-center space-x-2 text-indigo-500 hover:text-indigo-600 font-medium transition-colors border-b border-indigo-500/30 hover:border-indigo-500 pb-1">
            <Download className="w-4 h-4" />
            <span>Download Full PDF Resume</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`py-8 text-center text-sm border-t transition-colors ${
        isDark ? 'bg-slate-950 border-slate-900 text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}>
        <p>© {new Date().getFullYear()} Helen Stratford. Built with React & Tailwind CSS.</p>
      </footer>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDark ? '#1e293b' : '#f1f5f9'}; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDark ? '#475569' : '#cbd5e1'}; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? '#64748b' : '#94a3b8'}; 
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 300%;
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
}