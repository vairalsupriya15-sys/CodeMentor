import { CodeReview, PlatformStats, User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr_1',
    name: 'Supriya Vairal',
    username: '@supriya_v',
    email: 'supriya.v@college.edu',
    role: 'Computer Science (4th Year)',
    college: 'Pune Institute of Computer Technology',
    avatar: 'SV',
    reputation: 420,
    reviewsCount: 18,
    submissionsCount: 5
  },
  {
    id: 'usr_2',
    name: 'Rohit Sharma',
    username: '@rohit_cs',
    email: 'rohit.s@college.edu',
    role: 'IT Engineering (3rd Year)',
    college: 'College of Engineering',
    avatar: 'RS',
    reputation: 340,
    reviewsCount: 14,
    submissionsCount: 4
  },
  {
    id: 'usr_3',
    name: 'Ananya Gupta',
    username: '@ananya_dev',
    email: 'ananya.g@college.edu',
    role: 'Software Engineering (3rd Year)',
    college: 'National Institute of Technology',
    avatar: 'AG',
    reputation: 510,
    reviewsCount: 22,
    submissionsCount: 6
  },
  {
    id: 'usr_4',
    name: 'Aditya Kulkarni',
    username: '@aditya_k',
    email: 'aditya.k@college.edu',
    role: 'Computer Applications (2nd Year)',
    college: 'Vellore Institute of Technology',
    avatar: 'AK',
    reputation: 280,
    reviewsCount: 9,
    submissionsCount: 3
  }
];

export const INITIAL_REVIEWS: CodeReview[] = [
  {
    id: 'rev_201',
    title: 'Student Management System using Java and MySQL',
    description: 'A semester mini-project built with Java and JDBC to manage student admission records, marks calculation, and GPA generation stored in MySQL database. Need review on PreparedStatement queries and handling SQL exceptions.',
    language: 'Java',
    difficulty: 'Intermediate',
    reviewType: 'Mini Project',
    status: 'Open',
    loc: 112,
    author: {
      id: 'usr_1',
      name: 'Supriya Vairal',
      username: '@supriya_v',
      email: 'supriya.v@college.edu',
      college: 'Pune Institute of Computer Technology',
      avatar: 'SV',
      role: 'Computer Science (4th Year)'
    },
    code: `import java.sql.*;
import java.util.Scanner;

public class StudentManagementSystem {
    private static final String DB_URL = "jdbc:mysql://localhost:3306/college_db";
    private static final String USER = "root";
    private static final String PASS = "password123";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL, USER, PASS);
    }

    public static void addStudent(int rollNo, String name, String department, double cgpa) {
        String sql = "INSERT INTO students (roll_no, name, department, cgpa) VALUES (?, ?, ?, ?)";
        try (Connection conn = getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, rollNo);
            pstmt.setString(2, name);
            pstmt.setString(3, department);
            pstmt.setDouble(4, cgpa);
            
            int rowsAffected = pstmt.executeUpdate();
            if (rowsAffected > 0) {
                System.out.println("Student record registered successfully!");
            }
        } catch (SQLException e) {
            System.err.println("Database Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void displayAllStudents() {
        String query = "SELECT roll_no, name, department, cgpa FROM students ORDER BY roll_no ASC";
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {

            System.out.println("Roll No | Name | Department | CGPA");
            System.out.println("------------------------------------------");
            while (rs.next()) {
                System.out.printf("%d | %s | %s | %.2f%n",
                    rs.getInt("roll_no"),
                    rs.getString("name"),
                    rs.getString("department"),
                    rs.getDouble("cgpa")
                );
            }
        } catch (SQLException e) {
            System.err.println("Error fetching students: " + e.getMessage());
        }
    }
}`,
    repositoryUrl: 'https://github.com/supriya/student-management-system-java',
    tags: ['Java', 'MySQL', 'JDBC', 'OOP', 'SQL Queries'],
    comments: [
      {
        id: 'c_201_1',
        author: {
          id: 'usr_3',
          name: 'Ananya Gupta',
          username: '@ananya_dev',
          email: 'ananya.g@college.edu',
          avatar: 'AG',
          role: 'Software Engineering (3rd Year)',
          reputation: 510
        },
        lineNumber: 17,
        type: 'suggestion',
        content: 'Great job using try-with-resources! It automatically closes the Connection and PreparedStatement. For extra safety, you can add a primary key duplicate check or catch SQLIntegrityConstraintViolationException explicitly.',
        createdAt: '2026-10-09T08:15:00Z'
      }
    ],
    likesCount: 24,
    bookmarksCount: 15,
    rating: 4.8,
    reviewCount: 1,
    createdAt: '2026-10-09T07:30:00Z',
    updatedAt: '2026-10-09T08:15:00Z'
  },
  {
    id: 'rev_202',
    title: 'Online Quiz Application using React',
    description: 'Interactive multiple-choice quiz web application built for Web Technologies lab. Features dynamic timer per question, score tracking, option selection, and final summary report with correct answers.',
    language: 'React',
    difficulty: 'Beginner',
    reviewType: 'Course Assignment',
    status: 'In Review',
    loc: 96,
    author: {
      id: 'usr_2',
      name: 'Rohit Sharma',
      username: '@rohit_cs',
      email: 'rohit.s@college.edu',
      college: 'College of Engineering',
      avatar: 'RS',
      role: 'IT Engineering (3rd Year)'
    },
    code: `import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Which data structure uses LIFO (Last In First Out)?",
    options: ["Queue", "Stack", "Linked List", "Binary Tree"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "What is the time complexity of searching in a balanced BST?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    correctAnswer: 2
  }
];

export function QuizApp() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (isCompleted || timeLeft === 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isCompleted]);

  const handleNextQuestion = () => {
    if (selectedOption === SAMPLE_QUESTIONS[currentIdx].correctAnswer) {
      setScore((prev) => prev + 1);
    }
    setSelectedOption(null);
    setTimeLeft(15);

    if (currentIdx + 1 < SAMPLE_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <div className="quiz-container">
      {isCompleted ? (
        <div className="result-card">
          <h2>Quiz Completed!</h2>
          <p>Your Final Score: {score} / {SAMPLE_QUESTIONS.length}</p>
        </div>
      ) : (
        <div className="question-card">
          <div className="timer">Time Remaining: {timeLeft}s</div>
          <h3>Question {currentIdx + 1}: {SAMPLE_QUESTIONS[currentIdx].question}</h3>
          <div className="options-list">
            {SAMPLE_QUESTIONS[currentIdx].options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelectedOption(i)}
                className={selectedOption === i ? 'selected' : ''}
              >
                {opt}
              </button>
            ))}
          </div>
          <button onClick={handleNextQuestion} disabled={selectedOption === null}>
            Next Question
          </button>
        </div>
      )}
    </div>
  );
}`,
    repositoryUrl: 'https://github.com/rohit/react-college-quiz-app',
    tags: ['React', 'JavaScript', 'CSS', 'Hooks', 'Web Development'],
    comments: [
      {
        id: 'c_202_1',
        author: {
          id: 'usr_1',
          name: 'Supriya Vairal',
          username: '@supriya_v',
          email: 'supriya.v@college.edu',
          avatar: 'SV',
          role: 'Computer Science (4th Year)',
          reputation: 420
        },
        lineNumber: 38,
        type: 'suggestion',
        content: 'When timeLeft reaches 0, you should automatically trigger handleNextQuestion() so the student is marked 0 for that question and moves to the next one!',
        createdAt: '2026-10-09T09:10:00Z'
      }
    ],
    likesCount: 31,
    bookmarksCount: 19,
    rating: 4.9,
    reviewCount: 1,
    createdAt: '2026-10-08T18:00:00Z',
    updatedAt: '2026-10-09T09:10:00Z'
  },
  {
    id: 'rev_203',
    title: 'Hospital Management System using Java and MySQL',
    description: 'Core Java OOP project modeling Doctor, Patient, and Appointment classes with inheritance and file exports. Connects to MySQL schema to schedule OPD bookings and generate invoice bills.',
    language: 'Java',
    difficulty: 'Intermediate',
    reviewType: 'Course Assignment',
    status: 'In Review',
    loc: 138,
    author: {
      id: 'usr_4',
      name: 'Aditya Kulkarni',
      username: '@aditya_k',
      email: 'aditya.k@college.edu',
      college: 'Vellore Institute of Technology',
      avatar: 'AK',
      role: 'Computer Applications (2nd Year)'
    },
    code: `import java.sql.*;
import java.util.Date;

class Patient {
    protected int patientId;
    protected String name;
    protected int age;
    protected String bloodGroup;

    public Patient(int patientId, String name, int age, String bloodGroup) {
        this.patientId = patientId;
        this.name = name;
        this.age = age;
        this.bloodGroup = bloodGroup;
    }
}

public class HospitalService {
    private Connection conn;

    public HospitalService(Connection conn) {
        this.conn = conn;
    }

    public boolean bookAppointment(int patientId, int doctorId, Date date, String slot) {
        String sql = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, time_slot, status) VALUES (?, ?, ?, ?, 'BOOKED')";
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, patientId);
            stmt.setInt(2, doctorId);
            stmt.setDate(3, new java.sql.Date(date.getTime()));
            stmt.setString(4, slot);

            int count = stmt.executeUpdate();
            return count > 0;
        } catch (SQLException e) {
            System.err.println("Booking error: " + e.getMessage());
            return false;
        }
    }
}`,
    repositoryUrl: 'https://github.com/aditya/hospital-management-java',
    tags: ['Java', 'OOP', 'MySQL', 'Inheritance', 'JDBC'],
    comments: [
      {
        id: 'c_203_1',
        author: {
          id: 'usr_2',
          name: 'Rohit Sharma',
          username: '@rohit_cs',
          email: 'rohit.s@college.edu',
          avatar: 'RS',
          role: 'IT Engineering (3rd Year)',
          reputation: 340
        },
        lineNumber: 27,
        type: 'suggestion',
        content: 'Remember to check if doctor already has an appointment booked for that same time slot before inserting, to prevent double-booking collisions.',
        createdAt: '2026-10-09T08:45:00Z'
      }
    ],
    likesCount: 18,
    bookmarksCount: 11,
    rating: 4.7,
    reviewCount: 1,
    createdAt: '2026-10-08T12:00:00Z',
    updatedAt: '2026-10-09T08:45:00Z'
  },
  {
    id: 'rev_204',
    title: 'Weather Application using React and an API',
    description: 'Frontend assignment using OpenWeatherMap API to fetch city temperatures, humidity, weather icons, and wind speed. Includes search input with debounce and friendly error alert if city is not found.',
    language: 'React',
    difficulty: 'Beginner',
    reviewType: 'Mini Project',
    status: 'Completed',
    loc: 78,
    author: {
      id: 'usr_3',
      name: 'Ananya Gupta',
      username: '@ananya_dev',
      email: 'ananya.g@college.edu',
      college: 'National Institute of Technology',
      avatar: 'AG',
      role: 'Software Engineering (3rd Year)'
    },
    code: `import React, { useState } from 'react';

export function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');

    try {
      const apiKey = "demo_weather_key";
      const res = await fetch(
        \`https://api.openweathermap.org/data/2.5/weather?q=\${encodeURIComponent(city)}&units=metric&appid=\${apiKey}\`
      );
      if (!res.ok) throw new Error('City not found.');
      const data = await res.json();
      setWeather({
        city: data.name,
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="weather-card">
      <h2>Campus Weather Forecast</h2>
      <form onSubmit={fetchWeather}>
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city" />
        <button type="submit" disabled={loading}>Search</button>
      </form>
    </div>
  );
}`,
    repositoryUrl: 'https://github.com/ananya/react-weather-api-app',
    tags: ['React', 'API', 'JavaScript', 'Fetch', 'CSS'],
    comments: [
      {
        id: 'c_204_1',
        author: {
          id: 'usr_1',
          name: 'Supriya Vairal',
          username: '@supriya_v',
          email: 'supriya.v@college.edu',
          avatar: 'SV',
          role: 'Computer Science (4th Year)',
          reputation: 420
        },
        lineNumber: 24,
        type: 'approval',
        content: 'Clean fetch implementation and error handling! In production, move your API key to an environment variable so it is not visible in GitHub commits.',
        createdAt: '2026-10-09T05:00:00Z'
      }
    ],
    likesCount: 39,
    bookmarksCount: 22,
    rating: 5.0,
    reviewCount: 1,
    createdAt: '2026-10-07T14:00:00Z',
    updatedAt: '2026-10-09T05:00:00Z'
  },
  {
    id: 'rev_205',
    title: 'Banking System using Java and OOP',
    description: 'Object-Oriented Programming (OOP) assignment demonstrating Encapsulation, Abstract classes, and Inheritance. Implements Account base class with SavingsAccount and CheckingAccount child classes, deposit/withdrawal validation, and custom InsufficientFundsException.',
    language: 'Java',
    difficulty: 'Intermediate',
    reviewType: 'Course Assignment',
    status: 'Open',
    loc: 124,
    author: {
      id: 'usr_2',
      name: 'Rohit Sharma',
      username: '@rohit_cs',
      email: 'rohit.s@college.edu',
      college: 'College of Engineering',
      avatar: 'RS',
      role: 'IT Engineering (3rd Year)'
    },
    code: `class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

abstract class BankAccount {
    protected String accountNumber;
    protected double balance;

    public BankAccount(String accNo, double initialBalance) {
        this.accountNumber = accNo;
        this.balance = initialBalance;
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        this.balance += amount;
    }

    public abstract void withdraw(double amount) throws InsufficientFundsException;
}`,
    repositoryUrl: 'https://github.com/rohit/banking-system-oop-java',
    tags: ['Java', 'OOP', 'Inheritance', 'Exception Handling', 'Polymorphism'],
    comments: [
      {
        id: 'c_205_1',
        author: {
          id: 'usr_3',
          name: 'Ananya Gupta',
          username: '@ananya_dev',
          email: 'ananya.g@college.edu',
          avatar: 'AG',
          role: 'Software Engineering (3rd Year)',
          reputation: 510
        },
        lineNumber: 13,
        type: 'approval',
        content: 'Solid OOP design with abstract class and encapsulation. Excellent use of custom checked exception for business logic!',
        createdAt: '2026-10-09T06:30:00Z'
      }
    ],
    likesCount: 27,
    bookmarksCount: 16,
    rating: 4.8,
    reviewCount: 1,
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-09T06:30:00Z'
  },
  {
    id: 'rev_206',
    title: 'To-Do List Application using JavaScript',
    description: 'Vanilla JavaScript and DOM manipulation project. Users can add tasks, mark items as completed, filter by status (All, Active, Completed), and store all items in the browser localStorage so data persists across refreshes.',
    language: 'JavaScript',
    difficulty: 'Beginner',
    reviewType: 'Mini Project',
    status: 'Completed',
    loc: 85,
    author: {
      id: 'usr_4',
      name: 'Aditya Kulkarni',
      username: '@aditya_k',
      email: 'aditya.k@college.edu',
      college: 'Vellore Institute of Technology',
      avatar: 'AK',
      role: 'Computer Applications (2nd Year)'
    },
    code: `const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('student_tasks') || '[]');

function saveAndRender() {
    localStorage.setItem('student_tasks', JSON.stringify(tasks));
    renderTasks();
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;
    tasks.push({ text, completed: false, createdAt: Date.now() });
    taskInput.value = '';
    saveAndRender();
}`,
    repositoryUrl: 'https://github.com/aditya/javascript-todo-app',
    tags: ['JavaScript', 'HTML5', 'CSS', 'DOM', 'LocalStorage'],
    comments: [],
    likesCount: 35,
    bookmarksCount: 20,
    rating: 4.9,
    reviewCount: 0,
    createdAt: '2026-10-06T15:00:00Z',
    updatedAt: '2026-10-06T15:00:00Z'
  },
  {
    id: 'rev_207',
    title: 'CRUD Application using MERN Stack',
    description: 'Full-stack MERN (MongoDB, Express, React, Node.js) application for an e-library book catalog. Features Express REST API routes for Create, Read, Update, and Delete with Mongoose schema validation.',
    language: 'MERN Stack',
    difficulty: 'Advanced',
    reviewType: 'Final Year Project',
    status: 'In Review',
    loc: 142,
    author: {
      id: 'usr_1',
      name: 'Supriya Vairal',
      username: '@supriya_v',
      email: 'supriya.v@college.edu',
      college: 'Pune Institute of Computer Technology',
      avatar: 'SV',
      role: 'Computer Science (4th Year)'
    },
    code: `const express = require('express');
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  price: { type: Number, required: true, min: 0 }
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);`,
    repositoryUrl: 'https://github.com/supriya/mern-stack-crud-app',
    tags: ['MERN Stack', 'MongoDB', 'Express', 'React', 'Node.js', 'REST API'],
    comments: [
      {
        id: 'c_207_1',
        author: {
          id: 'usr_2',
          name: 'Rohit Sharma',
          username: '@rohit_cs',
          email: 'rohit.s@college.edu',
          avatar: 'RS',
          role: 'IT Engineering (3rd Year)',
          reputation: 340
        },
        lineNumber: 12,
        type: 'suggestion',
        content: 'Good schema definition! Make sure to add indexing on isbn for fast search lookup.',
        createdAt: '2026-10-09T08:00:00Z'
      }
    ],
    likesCount: 42,
    bookmarksCount: 27,
    rating: 5.0,
    reviewCount: 1,
    createdAt: '2026-10-07T09:00:00Z',
    updatedAt: '2026-10-09T08:00:00Z'
  },
  {
    id: 'rev_208',
    title: 'Sorting and Searching Algorithms in Java',
    description: 'Data Structures & Algorithms lab assignment comparing Bubble Sort, Merge Sort, Quick Sort, and Binary Search. Measures execution time in nanoseconds and tracks number of comparisons.',
    language: 'Java',
    difficulty: 'Intermediate',
    reviewType: 'Lab Practical',
    status: 'Open',
    loc: 110,
    author: {
      id: 'usr_3',
      name: 'Ananya Gupta',
      username: '@ananya_dev',
      email: 'ananya.g@college.edu',
      college: 'National Institute of Technology',
      avatar: 'AG',
      role: 'Software Engineering (3rd Year)'
    },
    code: `public class AlgorithmBenchmarks {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
    repositoryUrl: 'https://github.com/ananya/dsa-java-sorting-searching',
    tags: ['Java', 'Algorithms', 'Data Structures', 'QuickSort', 'Binary Search'],
    comments: [],
    likesCount: 29,
    bookmarksCount: 18,
    rating: 4.9,
    reviewCount: 0,
    createdAt: '2026-10-08T14:00:00Z',
    updatedAt: '2026-10-08T14:00:00Z'
  }
];

export const INITIAL_STATS: PlatformStats = {
  totalSubmissions: INITIAL_REVIEWS.length,
  openCount: INITIAL_REVIEWS.filter(r => r.status === 'Open').length,
  inReviewCount: INITIAL_REVIEWS.filter(r => r.status === 'In Review').length,
  completedCount: INITIAL_REVIEWS.filter(r => r.status === 'Completed').length,
  totalComments: INITIAL_REVIEWS.reduce((acc, r) => acc + r.comments.length, 0),
  activeMentors: INITIAL_USERS.length,
  avgTurnaroundTime: '1.8 hrs',
  satisfactionRate: '99.4%'
};
