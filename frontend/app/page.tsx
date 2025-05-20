'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import LoadingSpinner from './components/LoadingSpinner';
import ScoreTable from './components/ScoreTable';

// Dummy data for demonstration
const dummyScores = [
  {
    fileName: 'john_doe_resume.pdf',
    score: 92,
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: '5 years',
    education: 'Masters in Computer Science',
    location: 'New York, USA',
    lastPosition: 'Senior Frontend Developer'
  },
  {
    fileName: 'jane_smith_cv.pdf',
    score: 78,
    skills: ['JavaScript', 'Python', 'AWS'],
    experience: '3 years',
    education: 'Bachelor in Software Engineering',
    location: 'San Francisco, USA',
    lastPosition: 'Full Stack Developer'
  },
  {
    fileName: 'mike_johnson_resume.docx',
    score: 65,
    skills: ['Java', 'Spring', 'Docker'],
    experience: '4 years',
    education: 'Bachelor in Computer Engineering',
    location: 'London, UK',
    lastPosition: 'Backend Developer'
  },
  {
    fileName: 'sarah_williams_cv.pdf',
    score: 88,
    skills: ['Angular', 'MongoDB', 'Express'],
    experience: '6 years',
    education: 'PhD in Data Science',
    location: 'Toronto, Canada',
    lastPosition: 'Lead Developer'
  },
];

type Score = {
  fileName: string;
  score: number;
  skills: string[];
  experience: string;
  education: string;
  location: string;
  lastPosition: string;
};


export default function Home() {
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [resumes, setResumes] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scores, setScores] = useState<Score[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    if (inputMethod === 'text') {
      formData.append('job_desc', jobDescription);
    } else if (jobDescriptionFile) {
      formData.append('job_desc_file', jobDescriptionFile);
    }

    if (resumes) {
      Array.from(resumes).forEach((file) => {
        formData.append('resumes', file);
      });
    }

    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    try {
      const response = await fetch('http://localhost:5000/api/screen', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server error:', response.status, text);
        alert(`Error ${response.status}: ${text}`);
        return;
      }


      const data = await response.json();
      console.log('Response data:', data);
      setScores(data.scores);

    } catch (error: any) {
      alert(`Error processing resumes. ${error.message || 'Unknown error'} `);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-900 text-white py-4 px-6 sm:px-12 lg:px-20 mb-12 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>

            <span className="text-sm font-semibold tracking-wide text-blue-200 uppercase">
              Resume Screening Tool
            </span>
          </div>

        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Welcome to ResuMatch
          </h1>
          <p className="text-lg text-gray-500 mb-6">
            ResuMatch is an AI-powered resume screening tool designed to help you
            quickly and efficiently evaluate job applicants. Upload resumes and a
            job description to get instant feedback on candidate suitability.
          </p>
        </div>
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-0 lg:flex lg:gap-8">
            {/* Left Column - Job Description */}
            <div className="lg:flex-1">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Job Description Input Method
              </label>
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setInputMethod('text')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${inputMethod === 'text'
                    ? 'gradient-bg text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Enter Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMethod('file')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${inputMethod === 'file'
                    ? 'gradient-bg text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  Upload File
                </button>
              </div>

              {inputMethod === 'text' ? (
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Job Description
                  </label>
                  <textarea
                    className="w-full h-60 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    required={inputMethod === 'text'}
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <FileUpload
                    label="Upload Job Description"
                    accept=".pdf,.docx,.txt"
                    onChange={(files) => setJobDescriptionFile(files?.[0] || null)}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Resumes */}
            <div className="lg:flex-1">
              <div className="mb-6">
                <FileUpload
                  label="Upload Resumes"
                  accept=".pdf,.docx"
                  multiple={true}
                  onChange={setResumes}
                />
              </div>

              {resumes && resumes.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg mb-6">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Selected Files:</h3>
                  <ul className="text-sm text-blue-800 space-y-1 max-h-60 overflow-y-auto">
                    {Array.from(resumes).map((file, index) => (
                      <li key={index} className="flex items-center py-1">
                        <span className="mr-2">📄</span>
                        <span className="truncate">{file.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  (!jobDescription && !jobDescriptionFile) ||
                  !resumes ||
                  isLoading
                }
                className="w-full gradient-bg text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all lg:mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Screen Resumes'
                )}
              </button>
            </div>
          </form>
        </div>

        {isLoading && <LoadingSpinner />}

        {scores.length > 0 && <ScoreTable scores={scores} />}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-center">
            © 2025 ResuMatch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}