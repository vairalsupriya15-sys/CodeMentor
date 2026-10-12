import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle, ShieldAlert, Cpu, GitCommit, Database, 
  Terminal, Server, KeyRound, ArrowRight, ShieldCheck, FileCode
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'rubric' | 'viva_guide'>('rubric');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header card with tab switcher */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-blue-600 mb-1.5">
              <BookOpen className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Academic & Placement Guide</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              CodeMentor Documentation & Viva Guide
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Standard rubrics for college lab evaluations and architectural viva answers.
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-100 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab('rubric')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'rubric' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lab Rubric
            </button>
            <button
              onClick={() => setActiveSubTab('viva_guide')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'viva_guide' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Viva & REST Prep
            </button>
          </div>
        </div>

        {activeSubTab === 'rubric' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>1. OOP Principles & Logic</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Verify proper encapsulation with private attributes, meaningful inheritance, class cohesion, and correct method overriding in Java and Python assignments.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>2. Database & Resource Handling</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Always check that JDBC connections, files, and scanners are closed in try-with-resources, and verify PreparedStatement usage to prevent SQL injection.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>3. Exception & Error Handling</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ensure user inputs are validated, division by zero is handled, and specific exceptions like FileNotFoundException or NumberFormatException are caught gracefully.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
                  <GitCommit className="w-4 h-4 text-indigo-600" />
                  <span>4. Readability & Clean Code</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Check variable naming conventions (camelCase), meaningful comments, DRY (Don't Repeat Yourself) principle, and clean code formatting.
                </p>
              </div>
            </div>

            {/* Status Lifecycle workflow */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Review Lifecycle Stages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="font-bold">1. Open</div>
                  <div className="text-[11px] text-emerald-700 mt-0.5">Project submitted, awaiting first peer review inspection.</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="font-bold">2. In Review</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">Active classmate discussion and line-by-line feedback.</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                  <div className="font-bold">3. Completed</div>
                  <div className="text-[11px] text-blue-700 mt-0.5">Reviewed, approved, and ready for assignment lab submission.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                  <div className="font-bold">4. Closed</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Archived after academic submission or grading cycle.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'viva_guide' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Viva Explanation Section */}
            <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-sm">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>How to Explain CodeMentor in Your Viva / Interview:</span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                "CodeMentor is a full-stack peer code review platform. The frontend is built with React 19, TypeScript, and Tailwind CSS. The backend is an Express REST API with JWT authentication and bcrypt password hashing. Data is persistently stored in a transactional JSON document store (<code className="bg-blue-100 px-1 py-0.5 rounded font-mono">data/database.json</code>). Frontend components communicate with the backend using the <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">fetch()</code> API with Bearer tokens."
              </p>
            </div>

            {/* Architecture Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span>REST API Design</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Uses standard HTTP verbs: <strong>GET</strong> to query reviews, <strong>POST</strong> to submit assignments, <strong>PATCH</strong> to update status, and <strong>DELETE</strong> to remove comments.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span>Authentication</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Passwords are never stored in plaintext. They are salted and hashed using <strong>bcryptjs</strong> (10 rounds). Authenticated sessions use signed <strong>JSON Web Tokens (JWT)</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>MongoDB & Mongoose</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Configured with <strong>MongoDB & Mongoose ODM</strong> via <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">MONGODB_URI</code>. Enforces schema validation, unique indexes on email and username, and embedded comment subdocuments.
                </p>
              </div>
            </div>

            {/* Sample API Code Snippet */}
            <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 text-slate-200 font-mono text-xs overflow-x-auto space-y-1">
              <div className="text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                // Sample Frontend Fetch Request with Bearer Token:
              </div>
              <pre className="text-blue-300 text-[11px] pt-1">
{`const res = await fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    title: 'Library Management System using Java',
    language: 'Java',
    difficulty: 'Intermediate',
    code: '...'
  })
});
const data = await res.json();`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
