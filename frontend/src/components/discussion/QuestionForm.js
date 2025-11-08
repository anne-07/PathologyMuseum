import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createQuestion } from '../../services/discussionService';
import { useAuth } from '../../context/AuthContext';
import { handleAxiosError } from '../../utils/errorHandler';

const QuestionForm = ({ specimenId: propSpecimenId, onSuccess }) => {
  const { id: routeSpecimenId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use prop if provided, otherwise use URL param
  const resolvedSpecimenId = propSpecimenId || routeSpecimenId;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/specimens/${resolvedSpecimenId}/ask` } });
    } else if (user.role === 'admin') {
      // Redirect admins away from question creation
      navigate(`/specimens/${resolvedSpecimenId}/discussions`);
    }
  }, [user, navigate, resolvedSpecimenId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = {};
    
    if (!title.trim()) {
      validationErrors.title = 'Title is required';
    } else if (title.length < 10) {
      validationErrors.title = 'Title must be at least 10 characters long';
    } else if (title.length > 200) {
      validationErrors.title = 'Title cannot exceed 200 characters';
    }
    
    if (!content.trim()) {
      validationErrors.content = 'Question content is required';
    } else if (content.length < 20) {
      validationErrors.content = 'Question must be at least 20 characters long';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Process tags
    const tagsArray = tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5); // Limit to 5 tags
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const questionData = {
        title: title.trim(),
        content: content.trim(),
        specimenId: resolvedSpecimenId,
        isAnonymous: false, // Always false - anonymous posting removed
        tags: tagsArray
      };
      
      const response = await createQuestion(questionData);
      
      if (onSuccess) {
        onSuccess(response.data.question);
      } else {
        // Redirect to the question page
        navigate(`/questions/${response.data.question._id}`);
      }
      
    } catch (err) {
      setError(handleAxiosError(err, 'create'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const titleLen = title.length;
  const contentLen = content.length;

  return (
    <div className="mb-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <h3 className="text-2xl font-semibold text-gray-900">Ask a Question</h3>
        <p className="mt-1 text-sm text-gray-600">Keep it clear and specific. Include what you've tried.</p>
      </div>
      <div className="p-6">

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <label className="block mb-1 text-sm font-medium text-gray-800">Title</label>
              <span className={`text-xs ${titleLen > 200 ? 'text-red-600' : 'text-gray-400'}`}>{titleLen}/200</span>
            </div>
            <input
              type="text"
              className={`w-full rounded-lg px-3 py-2 text-sm shadow-sm ${errors.title ? 'border-red-500 focus:ring-red-500 border' : 'border border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
              placeholder="What's your question? Be specific."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              disabled={isSubmitting}
            />
            {errors.title && (
              <div className="mt-1 text-xs text-red-600">{errors.title}</div>
            )}
            <div className="mt-1 text-xs text-gray-500">Imagine you're asking a question to another person.</div>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between">
              <label className="block mb-1 text-sm font-medium text-gray-800">Details</label>
              <span className="text-xs text-gray-400">{contentLen} chars</span>
            </div>
            <textarea
              rows={8}
              className={`w-full rounded-lg px-3 py-2 text-sm shadow-sm ${errors.content ? 'border-red-500 focus:ring-red-500 border' : 'border border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2`}
              placeholder="Include all the information someone would need to answer your question"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (errors.content) setErrors({ ...errors, content: null });
              }}
              disabled={isSubmitting}
            />
            {errors.content && (
              <div className="mt-1 text-xs text-red-600">{errors.content}</div>
            )}
            <div className="mt-1 text-xs text-gray-500">Minimum 20 characters.</div>
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-gray-800">Tags</label>
            <input
              type="text"
              className="w-full rounded-lg px-3 py-2 text-sm shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., pathology, diagnosis, anatomy"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isSubmitting}
            />
            <div className="mt-1 text-xs text-gray-500">Add up to 5 tags separated by commas.</div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className={`px-4 py-2 rounded-md text-white text-sm shadow-sm ${isSubmitting || !title.trim() || !content.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Posting...' : 'Post Your Question'}
            </button>
            <button
              type="button"
              onClick={() => onSuccess ? onSuccess() : navigate(-1)}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md border text-sm shadow-sm ${isSubmitting ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;
