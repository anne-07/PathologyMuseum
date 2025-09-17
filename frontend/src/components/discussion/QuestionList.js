import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { getQuestionsBySpecimen, updateQuestion, createAnswer } from '../../services/discussionService';
import { useAuth } from '../../context/AuthContext';
import { Check, Lock, MessageSquare, Plus } from 'react-feather';

const QuestionList = ({ specimenId }) => {
  const { user } = useAuth();
  const { id: routeSpecimenId } = useParams();
  const resolvedSpecimenId = specimenId || routeSpecimenId;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  
  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';
  const [replyOpenFor, setReplyOpenFor] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const loadQuestions = async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      if (!resolvedSpecimenId) {
        throw new Error('Missing specimen ID');
      }
      const data = await getQuestionsBySpecimen(resolvedSpecimenId, pageNum);
      
      setQuestions(prev => append ? [...prev, ...data.data.questions] : data.data.questions);
      setHasMore(data.data.questions.length > 0);
      setError(null);
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Failed to load questions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedSpecimenId, sortBy]);


  const handleCloseQuestion = async (questionId) => {
    try {
      await updateQuestion(questionId, { isClosed: true });
      setQuestions(questions.map(q => 
        q._id === questionId ? { ...q, isClosed: true } : q
      ));
    } catch (err) {
      console.error('Error closing question:', err);
    }
  };

  const handleReopenQuestion = async (questionId) => {
    try {
      await updateQuestion(questionId, { isClosed: false });
      setQuestions(questions.map(q => 
        q._id === questionId ? { ...q, isClosed: false } : q
      ));
    } catch (err) {
      console.error('Error reopening question:', err);
    }
  };

  const handleReplySubmit = async (questionId) => {
    if (!replyText.trim()) return;
    try {
      setReplySubmitting(true);
      await createAnswer(questionId, { content: replyText, isAnonymous: false });
      // Optimistically reflect there is at least 1 answer
      setQuestions(prev => prev.map(q => q._id === questionId ? { ...q, answerCount: (q.answerCount || 0) + 1 } : q));
      setReplyText('');
      setReplyOpenFor(null);
    } catch (err) {
      console.error('Error submitting reply:', err);
    } finally {
      setReplySubmitting(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadQuestions(nextPage, true);
  };

  const renderStatusBadge = (question) => {
    if (question.isClosed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <Check size={12} /> Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
        <MessageSquare size={12} /> Open
      </span>
    );
  };

  if (loading && questions.length === 0) {
    return (
      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh]">
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="flex">
                  <div className="mr-4">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="flex gap-2 mt-3">
                      <div className="h-5 bg-gray-100 rounded w-16" />
                      <div className="h-5 bg-gray-100 rounded w-12" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh]">
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No questions yet</h3>
            <p className="text-gray-500 mb-6">
              {isAdmin 
                ? 'No questions to answer yet. Students can ask questions about this specimen.'
                : 'Be the first to ask a question about this specimen!'
              }
            </p>
            <Link 
              to={`/specimens/${resolvedSpecimenId}/ask`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors"
            >
              <Plus size={16} /> New Question
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh] space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Discussion</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white border-gray-300"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="unanswered">Unanswered</option>
          </select>
          <Link
            to={`/specimens/${resolvedSpecimenId}/ask`}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm text-center shadow-sm transition-colors"
          >
            <Plus size={16} /> New Question
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question._id} className={`bg-white rounded-lg border ${question.isClosed ? 'border-green-100' : 'border-gray-200'} hover:shadow-md transition-shadow`}>
            <div className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {renderStatusBadge(question)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    <Link to={`/questions/${question._id}`} className="hover:text-blue-600 hover:underline">
                      {question.title}
                    </Link>
                  </h3>
                  
                  <div className="text-sm text-gray-500 mb-3">
                    <span>#{question._id.substring(0, 6)}</span>
                    <span className="mx-1">•</span>
                    <span>Opened {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                    {question.user && !question.isAnonymous && (
                      <>
                        <span className="mx-1">by</span>
                        <span className="font-medium text-gray-700">{question.user.name}</span>
                      </>
                    )}
                    {question.answerCount > 0 && (
                      <>
                        <span className="mx-1">•</span>
                        <span className="text-gray-700">{question.answerCount} {question.answerCount === 1 ? 'reply' : 'replies'}</span>
                      </>
                    )}
                  </div>

                  <div className="text-gray-700 mb-3">
                    {question.content.length > 200 ? `${question.content.substring(0, 200)}...` : question.content}
                  </div>

                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {question.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {isAdmin && !question.isClosed && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReplyOpenFor(question._id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <MessageSquare size={14} /> Reply
                    </button>
                    <button
                      onClick={() => handleCloseQuestion(question._id)}
                      disabled={(question.answerCount || 0) === 0}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border ${
                        (question.answerCount || 0) === 0
                          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'bg-white text-green-700 border-green-200 hover:bg-green-50'
                      }`}
                    >
                      <Check size={14} /> Close
                    </button>
                  </div>
                )}
                
                {isAdmin && question.isClosed && (
                  <button
                    onClick={() => handleReopenQuestion(question._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    <Lock size={14} /> Reopen
                  </button>
                )}
              </div>
              
              {isAdmin && replyOpenFor === question._id && (
                <div className="mt-4 pl-8 border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Write a reply</h4>
                  <textarea
                    rows={3}
                    className="w-full border rounded-md px-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleReplySubmit(question._id)}
                      disabled={replySubmitting || !replyText.trim()}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-white ${
                        replySubmitting || !replyText.trim() 
                          ? 'bg-blue-300 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {replySubmitting ? 'Posting...' : 'Comment'}
                    </button>
                    <button
                      onClick={() => { setReplyOpenFor(null); setReplyText(''); }}
                      className="px-3 py-1.5 rounded-md text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 border rounded-md shadow-sm ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500" />
                Loading...
              </>
            ) : 'Load More Questions'}
          </button>
        </div>
      )}
      </div>
    </section>
  );
};

export default QuestionList;
