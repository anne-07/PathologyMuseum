import React, { useState } from 'react';
import { MessageSquare, X } from 'react-feather';

const AnswerForm = ({ 
  initialContent = '', 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  showAnonymousOption = false,
  submitButtonText = 'Comment',
  cancelButtonText = 'Cancel',
  placeholder = 'Leave a comment...',
  className = ''
}) => {
  const [content, setContent] = useState(initialContent);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const validationErrors = {};
    if (!content.trim()) {
      validationErrors.content = 'Comment cannot be empty';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Submit
    onSubmit(content, isAnonymous);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="comment" className="sr-only">
                  {placeholder}
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={placeholder}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errors.content) setErrors({ ...errors, content: null });
                  }}
                  disabled={isSubmitting}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
              </div>
              
              {showAnonymousOption && (
                <div className="flex items-center mb-4">
                  <input
                    id="anonymous-answer"
                    name="anonymous-answer"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="anonymous-answer" className="ml-2 block text-sm text-gray-700">
                    Post as anonymous
                  </label>
                </div>
              )}
              
              <div className="flex items-center justify-end gap-2">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <X className="mr-1.5 h-4 w-4" />
                    {cancelButtonText}
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    isSubmitting || !content.trim()
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  {isSubmitting ? 'Posting...' : submitButtonText}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerForm;
