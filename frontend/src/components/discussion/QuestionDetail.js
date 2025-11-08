import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  getQuestion, 
  updateQuestion, 
  deleteQuestion, 
  createAnswer,
  updateAnswer,
  deleteAnswer,
  markBestAnswer,
  getAnswers
} from '../../services/discussionService';
import AnswerList from './AnswerList';
import AnswerForm from './AnswerForm';
import { useAuth } from '../../context/AuthContext';
import { Check, Lock, MessageSquare, Plus, Edit, Trash2, CheckCircle } from 'react-feather';
import { handleAxiosError } from '../../utils/errorHandler';

const QuestionDetail = () => {
  const { id: questionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [answerPage, setAnswerPage] = useState(1);
  const [hasMoreAnswers, setHasMoreAnswers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMoreAnswers, setLoadingMoreAnswers] = useState(false);

  // Compute ownership early so it can be safely used in effects
  const currentUserId = user?.id || user?._id;
  const isQuestionOwner = user && question && question.user && (currentUserId === question.user._id);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const data = await getQuestion(questionId);
      setQuestion(data.data.question);
      setEditedContent(data.data.question.content);
      setAnswers(data.data.question.answers || []);
      setHasMoreAnswers((data.data.question.answers?.length || 0) > 0);
      setError(null);
    } catch (err) {
      setError(handleAxiosError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldEdit = params.get('edit') === '1';
    if (shouldEdit && isQuestionOwner) {
      setEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, user, question, isQuestionOwner]);

  const handleDelete = async () => {
    try {
      await deleteQuestion(questionId);
      navigate(`/specimens/${question.specimen._id}`);
    } catch (err) {
      setError(handleAxiosError(err, 'delete'));
    }
  };

  const handleUpdate = async () => {
    try {
      const updatedQuestion = await updateQuestion(questionId, { 
        content: editedContent 
      });
      setQuestion(prev => {
        const serverQ = updatedQuestion.data.question || {};
        return {
          ...prev,
          ...serverQ,
          // ensure we don't lose the populated user (server may return only an id)
          user: (serverQ.user && typeof serverQ.user === 'object') ? serverQ.user : prev.user,
          content: editedContent
        };
      });
      setEditing(false);
    } catch (err) {
      setError(handleAxiosError(err, 'update'));
    }
  };

  const handleAnswerSubmit = async (content, isAnonymous) => {
    try {
      setIsSubmitting(true);
      const response = await createAnswer(questionId, { 
        content, 
        isAnonymous: isAnonymous || false 
      });
      
      setAnswers(prev => [response.data.answer, ...prev]);
      setQuestion(prev => ({
        ...prev,
        answerCount: (prev.answerCount || 0) + 1
      }));
      setShowAnswerForm(false);
    } catch (err) {
      setError(handleAxiosError(err, 'create'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerUpdate = async (answerId, content) => {
    try {
      const updatedAnswer = await updateAnswer(answerId, { content });
      setAnswers(prev => 
        prev.map(a => 
          a._id === answerId 
            ? { ...a, content, editedAt: new Date().toISOString() } 
            : a
        )
      );
      return true;
    } catch (err) {
      console.error('Error updating answer:', err);
      // Error is handled by the component calling this
      return false;
    }
  };

  const handleAnswerDelete = async (answerId) => {
    try {
      await deleteAnswer(answerId);
      setAnswers(prev => prev.filter(a => a._id !== answerId));
      setQuestion(prev => ({
        ...prev,
        answerCount: Math.max(0, (prev.answerCount || 1) - 1)
      }));
      return true;
    } catch (err) {
      console.error('Error deleting answer:', err);
      // Error is handled by the component calling this
      return false;
    }
  };

  const handleMarkBestAnswer = async (answerId) => {
    try {
      const response = await markBestAnswer(answerId);
      
      // Update the question with the new best answer
      setQuestion(prev => ({
        ...prev,
        bestAnswer: response.data.answer.isBestAnswer ? response.data.answer._id : null
      }));
      
      // Update the answers list
      setAnswers(prev => 
        prev.map(a => ({
          ...a,
          isBestAnswer: a._id === answerId 
            ? response.data.answer.isBestAnswer 
            : false
        }))
      );
      
      return true;
    } catch (err) {
      console.error('Error marking best answer:', err);
      // Error is handled by the component calling this
      return false;
    }
  };

  const loadMoreAnswers = async () => {
    try {
      const nextPage = answerPage + 1;
      const data = await getAnswers(questionId, nextPage);
      
      if (data.data.answers.length > 0) {
        setAnswers(prev => [...prev, ...data.data.answers]);
        setAnswerPage(nextPage);
      } else {
        setHasMoreAnswers(false);
      }
    } catch (err) {
      console.error('Error loading more answers:', err);
    }
  };

  const canMarkBestAnswer = user && question && 
    ((question.user && currentUserId === question.user._id) || 
     user.role === 'admin');

  if (loading && !question) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-1/2"></div>
          <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg"></div>
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md mb-6 shadow-sm">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Error loading question</span>
          </div>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Warning: </strong>
          <span className="block sm:inline">Question not found</span>
        </div>
      </div>
    );
  }

  // Determine back navigation path
  const getBackPath = () => {
    if (question?.specimen) {
      return `/specimens/${question.specimen._id}`;
    }
    return '/discussions'; // Fallback to all discussions page
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center transition-colors" 
            onClick={() => navigate(-1)}
          >
            <span className="mr-1">←</span> Back
          </button>
          {question?.specimen && (
            <Link
              to={getBackPath()}
              className="text-sm text-gray-600 hover:text-primary-600 font-medium flex items-center transition-colors"
            >
              View Specimen
              <span className="ml-1">→</span>
            </Link>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {question.title}
                </h1>
                {question.isClosed ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <Lock className="mr-1 h-3 w-3" />
                    Closed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    Open
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-sm mr-3">
                  {question.user?.username ? question.user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <span className="font-medium text-gray-900">{question.user?.username || 'Unknown'}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-500" title={new Date(question.createdAt).toLocaleString()}>
                    {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                  </span>
                  {question.updatedAt !== question.createdAt && (
                    <span className="text-xs text-gray-400 ml-2" title={new Date(question.updatedAt).toLocaleString()}>
                      (edited {formatDistanceToNow(new Date(question.updatedAt), { addSuffix: true })})
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {(isQuestionOwner || user?.role === 'admin') && (
              <div className="flex space-x-1">
                {isQuestionOwner && !question.isClosed && (
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit question"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                {(isQuestionOwner || user?.role === 'admin') && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-4">
              <textarea
                className="w-full border border-gray-300 rounded-lg p-4 mb-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={6}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-300 font-medium transition-colors"
                >
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
              {question.content}
            </div>
          )}
        </div>


        {/* Answers Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
              <span className="bg-primary-600 text-white text-sm font-semibold mr-2 px-2.5 py-1 rounded-full">
                {answers.length}
              </span>
              {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
            
            {user?.role === 'admin' && !showAnswerForm && !question.isClosed && (
              <button 
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium flex items-center hover:bg-primary-700 shadow-sm transition-colors"
                onClick={() => setShowAnswerForm(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Post Admin Reply
              </button>
            )}
          </div>

          {/* Answer Form */}
          {showAnswerForm && user?.role === 'admin' && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-5 mb-6">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-sm mr-2">
                  {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <h4 className="font-medium text-gray-900">Posting as Administrator</h4>
              </div>
              <AnswerForm
                onSubmit={handleAnswerSubmit}
                onCancel={() => setShowAnswerForm(false)}
                isSubmitting={isSubmitting}
                submitButtonText={isSubmitting ? 'Posting...' : 'Post as Admin'}
                className="bg-white rounded-lg"
              />
            </div>
          )}

          {/* Answers List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <AnswerList 
              answers={answers}
              questionOwnerId={question.user?._id}
              bestAnswerId={question.bestAnswer}
              onUpdate={handleAnswerUpdate}
              onDelete={handleAnswerDelete}
              onMarkBest={handleMarkBestAnswer}
              canMarkBestAnswer={canMarkBestAnswer}
              currentUserId={currentUserId}
              isAuthenticated={!!user}
              isAdmin={user?.role === 'admin'}
            />
          </div>
        </div>

        {hasMoreAnswers && (
          <div className="text-center mt-6">
            <button 
              className={`px-4 py-2 border border-gray-300 rounded-lg font-medium transition-colors ${
                loadingMoreAnswers 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={loadMoreAnswers}
              disabled={loadingMoreAnswers}
            >
              {loadingMoreAnswers ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></span>
                  Loading...
                </span>
              ) : 'Load More Answers'}
            </button>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Question</h3>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="mb-6 text-gray-600">Are you sure you want to delete this question? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
