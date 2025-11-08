import React, { useState } from 'react';
import QuestionList from './QuestionList';
import QuestionForm from './QuestionForm';
import { useAuth } from '../../context/AuthContext';

const DiscussionSection = ({ specimenId, isLoggedIn, onNavigateToLogin }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('questions');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  
  const isAdmin = user?.role === 'admin';

  const handleAskQuestion = () => {
    if (!isLoggedIn) {
      onNavigateToLogin();
      return;
    }
    setShowQuestionForm(true);
  };

  const handleQuestionCreated = (question) => {
    setShowQuestionForm(false);
    setActiveTab('questions');
    // You could add logic here to show the newly created question
  };

  return (
    <section className="py-4 border-t border-gray-200 mt-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">💬</span>
            <h3 className="text-xl font-semibold">
              Discussion Forum
            </h3>
          </div>
          
          {!showQuestionForm && !isAdmin && (
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center"
              onClick={handleAskQuestion}
            >
              <span className="mr-1">+</span>
              Ask a Question
            </button>
          )}
          {isAdmin && (
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-md">
              👨‍🏫 Admin Mode: Answer questions and manage discussions
            </div>
          )}
        </div>

        {showQuestionForm ? (
          <div className="mb-6">
            <button 
              className="text-blue-500 hover:text-blue-700 mb-4 p-0 flex items-center"
              onClick={() => setShowQuestionForm(false)}
            >
              ← Back to questions
            </button>
            <QuestionForm 
              specimenId={specimenId} 
              onSuccess={handleQuestionCreated}
            />
          </div>
        ) : (
          <div className="mb-6">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'questions' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <span className="flex items-center">
                    <span className="mr-2">❓</span>
                    Questions
                  </span>
                </button>
                
                <button
                  onClick={() => setActiveTab('my-questions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'my-questions' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <span className="flex items-center">
                    <span className="mr-2">👤</span>
                    My Questions
                  </span>
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="mt-4">
              {activeTab === 'questions' && (
                <QuestionList 
                  specimenId={specimenId}
                  onQuestionSelect={(question) => {
                    // Handle question selection if needed
                  }}
                />
              )}
              
              {activeTab === 'my-questions' && (
                <QuestionList 
                  specimenId={specimenId}
                  myQuestions={true}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DiscussionSection;
