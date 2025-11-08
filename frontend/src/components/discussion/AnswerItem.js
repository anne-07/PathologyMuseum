import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';

const AnswerItem = ({
  answer,
  isBestAnswer,
  isQuestionOwner,
  canMarkBestAnswer,
  onUpdate,
  onDelete,
  onMarkBest,
  onVote,
  currentUserId,
  className = ''
}) => {
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(answer.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAnswerOwner = answer.user && currentUserId === answer.user._id;
  const canEdit = isAnswerOwner || currentUserId === answer.user;
  const canDelete = isAnswerOwner || isQuestionOwner || currentUserId?.role === 'admin';
  const showMarkBest = canMarkBestAnswer && !isBestAnswer && !answer.isAnonymous;

  const handleUpdate = async () => {
    if (!editedContent.trim()) return;
    
    setIsUpdating(true);
    const success = await onUpdate(answer._id, editedContent);
    if (success) {
      setEditing(false);
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      setIsDeleting(true);
      await onDelete(answer._id);
      setIsDeleting(false);
    }
  };

  const handleMarkBest = async () => {
    await onMarkBest(answer._id);
  };

  const handleVote = (voteType) => {
    onVote(answer._id, voteType);
  };

  const getVoteCount = () => {
    return (answer.upvotes?.length || 0) - (answer.downvotes?.length || 0);
  };

  const userVote = answer.userVote || 
    (answer.upvotes?.includes(currentUserId) ? 'up' : 
     answer.downvotes?.includes(currentUserId) ? 'down' : null);

  return (
    <div className={`card mb-3 ${isBestAnswer ? 'border-success' : ''}`}>
      <div className="card-body p-3">
        <div className="d-flex">
          {/* Vote buttons */}
          <div className="d-flex flex-column align-items-center me-3">
            <button 
              className={`btn btn-sm mb-1 ${userVote === 'up' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => handleVote('up')}
              disabled={!currentUserId}
            >
              ↑
            </button>
            <span className="mx-1">
              {getVoteCount()}
            </span>
            <button
              className={`btn btn-sm mt-1 ${userVote === 'down' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => handleVote('down')}
              disabled={!currentUserId}
            >
              ↓
            </button>

            {showMarkBest && (
              <button
                className="btn btn-sm btn-outline-success mt-2"
                onClick={handleMarkBest}
                disabled={isDeleting}
              >
                ✓
                Mark as Best
              </button>
            )}
          </div>

          {canEdit && !editing && (
            <div className="d-flex">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => setEditing(true)}
                disabled={isDeleting}
              >
                ✏️
              </button>
              <button
                className="btn btn-sm btn-outline-danger ms-1"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <span role="img" aria-label="delete">🗑️</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerItem;
