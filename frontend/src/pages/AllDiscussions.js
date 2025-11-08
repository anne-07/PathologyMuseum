import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ChatBubbleLeftRightIcon, CheckCircleIcon, ClockIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { handleAxiosError } from '../utils/errorHandler';

export default function AllDiscussions() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unanswered', 'answered'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'mostAnswers'
  const [selectedSpecimen, setSelectedSpecimen] = useState('');
  const [specimens, setSpecimens] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unanswered: 0,
    answered: 0
  });

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch all questions
  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/discussions/all?status=${filter}`, {
        withCredentials: true
      });
      
      const fetchedQuestions = res.data.data.questions || [];
      
      // Filter out orphaned questions (those with deleted specimens)
      const validQuestions = fetchedQuestions.filter(q => q.specimen && q.specimen._id);
      setQuestions(validQuestions);

      // Extract unique specimens for filter (only from valid questions)
      const uniqueSpecimens = [...new Set(validQuestions
        .filter(q => q.specimen)
        .map(q => JSON.stringify({ id: q.specimen._id, title: q.specimen.title })))]
        .map(s => JSON.parse(s));
      setSpecimens(uniqueSpecimens);

      // Calculate stats (only from valid questions)
      const total = validQuestions.length;
      const unanswered = validQuestions.filter(q => q.answerCount === 0).length;
      const answered = validQuestions.filter(q => q.answerCount > 0).length;
      
      setStats({ total, unanswered, answered });
    } catch (err) {
      // If it's a 401 and we're still authenticated, the interceptor should handle it
      // But if it persists, show error and check auth status
      if (err.response?.status === 401) {
        // Check if user is still authenticated
        const storedUser = localStorage.getItem('user');
        if (!storedUser || !isAuthenticated) {
          navigate('/login');
          return;
        }
      }
      setError(handleAxiosError(err, 'fetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  // Apply filters and sorting
  useEffect(() => {
    // First, filter out questions with deleted specimens (orphaned questions)
    let filtered = questions.filter(q => q.specimen && q.specimen._id);

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.title.toLowerCase().includes(query) ||
        q.content.toLowerCase().includes(query) ||
        q.user?.username?.toLowerCase().includes(query) ||
        q.specimen?.title?.toLowerCase().includes(query)
      );
    }

    // Specimen filter
    if (selectedSpecimen) {
      filtered = filtered.filter(q => q.specimen?._id === selectedSpecimen);
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'mostAnswers':
        filtered.sort((a, b) => (b.answerCount || 0) - (a.answerCount || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredQuestions(filtered);
  }, [questions, searchQuery, sortBy, selectedSpecimen]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecimen('');
    setSortBy('newest');
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Time ago helper
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 mr-3 text-primary-600" />
            Discussion Forum
          </h1>
          
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Questions</dt>
                    <dd className="text-lg font-semibold text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Answers</dt>
                    <dd className="text-lg font-semibold text-orange-600">{stats.unanswered}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Answered</dt>
                    <dd className="text-lg font-semibold text-green-600">{stats.answered}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setFilter('all')}
                className={`${
                  filter === 'all'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                All Questions
              </button>
              <button
                onClick={() => setFilter('unanswered')}
                className={`${
                  filter === 'unanswered'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                Pending Answers
                {stats.unanswered > 0 && (
                  <span className="ml-2 bg-orange-100 text-orange-800 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {stats.unanswered}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter('answered')}
                className={`${
                  filter === 'answered'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Answered
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search questions, content, or student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* Specimen Filter */}
            <div className="w-full md:w-64">
              <select
                value={selectedSpecimen}
                onChange={(e) => setSelectedSpecimen(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
              >
                <option value="">All Specimens</option>
                {specimens.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostAnswers">Most Answers</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || selectedSpecimen || sortBy !== 'newest') && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedSpecimen) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <MagnifyingGlassIcon className="h-4 w-4 mr-1" />
                  "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedSpecimen && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  <FunnelIcon className="h-4 w-4 mr-1" />
                  {specimens.find(s => s.id === selectedSpecimen)?.title}
                  <button
                    onClick={() => setSelectedSpecimen('')}
                    className="ml-2 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredQuestions.length} of {questions.length} questions
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white shadow rounded-lg">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading questions...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              {error}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery || selectedSpecimen ? (
                <div>
                  <p className="mb-2">No questions match your filters</p>
                  <button
                    onClick={clearFilters}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    Clear filters to see all questions
                  </button>
                </div>
              ) : (
                filter === 'unanswered' ? 'No pending questions' : 
                filter === 'answered' ? 'No answered questions yet' : 
                'No questions yet'
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredQuestions.map((question) => {
                // Link to question detail page where users can view and answer
                const questionDetailPath = `/questions/${question._id}`;
                
                // Secondary link to view the specimen (should always be available since we filter)
                const specimenId = question.specimen._id;
                const specimenPath = `/specimens/${specimenId}`;
                
                const content = (
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Question Title - Clickable to view full question */}
                      <div className="flex items-center mb-2">
                        <Link 
                          to={questionDetailPath}
                          className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {question.title}
                        </Link>
                        {question.isPinned && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pinned
                          </span>
                        )}
                        {question.isClosed && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Closed
                          </span>
                        )}
                      </div>

                      {/* Question Content Preview */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {question.content}
                      </p>

                      {/* Meta Information */}
                      <div className="flex items-center text-sm text-gray-500 space-x-4 flex-wrap">
                        <span className="flex items-center">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                          {question.answerCount || 0} {question.answerCount === 1 ? 'answer' : 'answers'}
                        </span>
                        <span>
                          Asked by {question.user?.username || 'Anonymous'}
                        </span>
                        <span>{timeAgo(question.createdAt)}</span>
                        <Link 
                          to={specimenPath}
                          className="text-primary-600 hover:text-primary-800 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                          title="View specimen"
                        >
                          in {question.specimen.title}
                        </Link>
                      </div>

                      {/* Tags */}
                      {question.tags && question.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {question.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="ml-4 flex-shrink-0">
                      {question.answerCount === 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Answered
                        </span>
                      )}
                    </div>
                  </div>
                );

                return (
                  <li 
                    key={question._id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(questionDetailPath)}
                  >
                    {content}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

