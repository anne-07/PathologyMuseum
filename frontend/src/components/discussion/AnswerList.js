import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, MessageSquare, Edit, Trash2 } from 'react-feather';

const AnswerItem = ({ 
  answer, 
  isBestAnswer, 
  isQuestionOwner,
  currentUserId,
  onUpdate,
  onDelete,
  onMarkBest,
  className = ''
}) => {
  const isAuthor = answer.user && currentUserId === answer.user._id;
  const canEdit = isAuthor || isQuestionOwner;
  const canDelete = isAuthor || isQuestionOwner;
  const canMarkAsBest = isQuestionOwner && !isBestAnswer;

  return (
    <div className={`border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0 ${className}`}>
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span className="font-medium text-gray-900 mr-2">
              {answer.user?.name || 'Anonymous'}
            </span>
            <span className="mx-1">•</span>
            <span>{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
            {answer.updatedAt !== answer.createdAt && (
              <>
                <span className="mx-1">•</span>
                <span>edited {formatDistanceToNow(new Date(answer.updatedAt), { addSuffix: true })}</span>
              </>
            )}
            {isBestAnswer && (
              <span className="ml-2 inline-flex items-center text-green-600 text-xs font-medium">
                <CheckCircle className="mr-1" size={14} /> Best Answer
              </span>
            )}
          </div>
          
          <div className="text-gray-800 mb-3">
            {answer.content}
          </div>

          {(canEdit || canDelete || canMarkAsBest) && (
            <div className="flex gap-2 text-sm">
              {canEdit && (
                <button 
                  onClick={() => onUpdate(answer)}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Edit size={14} className="mr-1" /> Edit
                </button>
              )}
              {canDelete && (
                <button 
                  onClick={() => onDelete(answer._id)}
                  className="text-red-600 hover:text-red-800 flex items-center"
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </button>
              )}
              {canMarkAsBest && (
                <button 
                  onClick={() => onMarkBest(answer._id)}
                  className="text-green-600 hover:text-green-800 flex items-center"
                >
                  <CheckCircle size={14} className="mr-1" /> Mark as best
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnswerList = ({
  answers,
  questionOwnerId,
  bestAnswerId,
  onUpdate,
  onDelete,
  onMarkBest,
  currentUserId,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (answers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare size={24} className="mx-auto mb-2 text-gray-300" />
        <p>No replies yet. Be the first to reply!</p>
      </div>
    );
  }

  // Separate best answer (if exists) from other answers
  const bestAnswer = bestAnswerId ? answers.find(a => a._id === bestAnswerId) : null;
  const otherAnswers = answers.filter(a => !bestAnswerId || a._id !== bestAnswerId);

  return (
    <div className="space-y-6">
      {/* Best Answer */}
      {bestAnswer && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
          <div className="flex items-center text-green-800 font-medium mb-3">
            <CheckCircle className="mr-2" size={18} />
            <span>Marked as best answer</span>
          </div>
          <AnswerItem
            answer={bestAnswer}
            isBestAnswer={true}
            isQuestionOwner={questionOwnerId === currentUserId}
            currentUserId={currentUserId}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onMarkBest={onMarkBest}
          />
        </div>
      )}

      {/* Other Answers */}
      {otherAnswers.length > 0 && (
        <div className="space-y-6">
          {otherAnswers.map((answer) => (
            <AnswerItem
              key={answer._id}
              answer={answer}
              isBestAnswer={false}
              isQuestionOwner={questionOwnerId === currentUserId}
              currentUserId={currentUserId}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onMarkBest={onMarkBest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnswerList;
