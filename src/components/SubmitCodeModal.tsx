import React, { useState } from 'react';
import { X, Sparkles, Send, FileCode } from 'lucide-react';
import { DifficultyLevel, ReviewCategory } from '../types';

interface SubmitCodeModalProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    language: string;
    difficulty: DifficultyLevel;
    reviewType: ReviewCategory;
    code: string;
    repositoryUrl?: string;
    tags: string[];
  }) => Promise<void>;
}

const TEMPLATE_PRESETS = [
  {
    name: 'Library Management (Java)',
    title: 'Library Management System using Java',
    language: 'Java',
    difficulty: 'Intermediate' as DifficultyLevel,
    reviewType: 'Course Assignment' as ReviewCategory,
    tags: ['Java', 'OOP', 'Collections', 'File I/O', 'Library'],
    description: 'College assignment managing book inventory, student issue records, and return fines using Java Collections and ArrayLists.',
    code: `import java.util.*;

class Book {
    private int bookId;
    private String title;
    private String author;
    private boolean isIssued;

    public Book(int bookId, String title, String author) {
        this.bookId = bookId;
        this.title = title;
        this.author = author;
        this.isIssued = false;
    }

    public int getBookId() { return bookId; }
    public String getTitle() { return title; }
    public boolean isIssued() { return isIssued; }
    public void setIssued(boolean status) { this.isIssued = status; }
}

public class LibraryManagementSystem {
    private List<Book> books = new ArrayList<>();

    public void addBook(Book b) {
        books.add(b);
        System.out.println("Book '" + b.getTitle() + "' added to library catalog.");
    }

    public boolean issueBook(int bookId, String studentRoll) {
        for (Book b : books) {
            if (b.getBookId() == bookId) {
                if (!b.isIssued()) {
                    b.setIssued(true);
                    System.out.println("Book issued to student: " + studentRoll);
                    return true;
                } else {
                    System.out.println("Sorry, book is currently issued to another student.");
                    return false;
                }
            }
        }
        System.out.println("Book ID " + bookId + " not found in library.");
        return false;
    }
}`
  },
  {
    name: 'Portfolio Website (HTML/CSS/JS)',
    title: 'Personal Portfolio Website using HTML, CSS, and JavaScript',
    language: 'JavaScript',
    difficulty: 'Beginner' as DifficultyLevel,
    reviewType: 'Mini Project' as ReviewCategory,
    tags: ['HTML', 'CSS', 'JavaScript', 'Responsive', 'Portfolio'],
    description: 'Student resume portfolio with responsive mobile navbar toggle, dark mode switcher, and project showcases filter.',
    code: `// Mobile Navigation Toggle & Theme Switcher
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const themeToggleBtn = document.getElementById('theme-toggle');

// Toggle mobile navigation
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Toggle dark / light theme
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('portfolio-theme', isDark ? 'dark' : 'light');
});`
  },
  {
    name: 'File & Exception Handling (Java)',
    title: 'File Handling and Exception Handling in Java',
    language: 'Java',
    difficulty: 'Beginner' as DifficultyLevel,
    reviewType: 'Lab Practical' as ReviewCategory,
    tags: ['Java', 'File Handling', 'Exceptions', 'BufferedReader', 'Try-Catch'],
    description: 'Lab practical exercise reading student grade sheets from a CSV file, computing averages, and writing passed students to output.txt with robust exception handling.',
    code: `import java.io.*;

public class StudentFileProcessor {
    public static void main(String[] args) {
        String inputFile = "students.csv";
        String outputFile = "results.txt";

        try (BufferedReader br = new BufferedReader(new FileReader(inputFile));
             BufferedWriter bw = new BufferedWriter(new FileWriter(outputFile))) {

            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length < 3) continue;

                String rollNo = parts[0].trim();
                String name = parts[1].trim();
                double marks = Double.parseDouble(parts[2].trim());

                if (marks >= 40.0) {
                    bw.write(String.format("PASS: %s - %s (%.1f marks)%n", rollNo, name, marks));
                }
            }
            System.out.println("Processing completed successfully.");

        } catch (FileNotFoundException e) {
            System.err.println("Input file not found: " + e.getMessage());
        } catch (NumberFormatException e) {
            System.err.println("Invalid number format in file data: " + e.getMessage());
        } catch (IOException e) {
            System.err.println("Error reading or writing file: " + e.getMessage());
        }
    }
}`
  }
];

export const SubmitCodeModal: React.FC<SubmitCodeModalProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('Java');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Beginner');
  const [reviewType, setReviewType] = useState<ReviewCategory>('Course Assignment');
  const [description, setDescription] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('Java, OOP, Mini Project');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loc = code.split('\n').filter(l => l.trim().length > 0).length;

  const handleApplyPreset = (preset: typeof TEMPLATE_PRESETS[0]) => {
    setTitle(preset.title);
    setLanguage(preset.language);
    setDifficulty(preset.difficulty);
    setReviewType(preset.reviewType);
    setTagsInput(preset.tags.join(', '));
    setDescription(preset.description);
    setCode(preset.code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      setError('Project title and Code snippet are required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        language,
        difficulty,
        reviewType,
        code,
        repositoryUrl: repositoryUrl.trim() || undefined,
        tags: tags.length > 0 ? tags : [language, reviewType],
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Submit College Project for Peer Review
              </h2>
              <p className="text-xs text-slate-500">
                Get constructive feedback on code structure, OOP logic, and assignment standards from college peers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Quick Presets Bar */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Quick Sample Projects:
            </span>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_PRESETS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-blue-600 hover:text-white text-blue-700 border border-blue-300 shadow-2xs transition-all"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Student Management System using Java and MySQL"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Language / Tech
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                {['Java', 'React', 'Python', 'JavaScript', 'MERN Stack', 'C++', 'MySQL', 'HTML/CSS'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={reviewType}
                onChange={e => setReviewType(e.target.value as ReviewCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="Course Assignment">Course Assignment</option>
                <option value="Mini Project">Mini Project</option>
                <option value="Lab Practical">Lab Practical</option>
                <option value="Final Year Project">Final Year Project</option>
                <option value="Clean Code">Clean Code</option>
              </select>
            </div>
          </div>

          {/* Description & Questions */}
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
              Short Project Description & Questions for Peers
            </label>
            <textarea
              rows={2}
              placeholder="Describe what the assignment does, key classes used, or specific logic you want peers to verify..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-sans"
            />
          </div>

          {/* Tags & GitHub URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                Technology Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Java, MySQL, JDBC, OOP"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                GitHub Repository Link (optional)
              </label>
              <input
                type="url"
                placeholder="https://github.com/student/my-college-project"
                value={repositoryUrl}
                onChange={e => setRepositoryUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Code Snippet Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Source Code *
              </label>
              <span className="text-xs font-mono text-blue-600 font-semibold">
                {loc} Lines of Code
              </span>
            </div>
            <textarea
              required
              rows={10}
              placeholder="Paste your Java class, React component, or Python script here..."
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full p-3.5 bg-[#0F172A] text-slate-100 border border-slate-800 rounded-xl font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/30 selection:bg-blue-800"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title || !code}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Project for Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
