import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, ThumbsUp, MessageSquare, Edit, Trash2 } from 'react-feather';
import { voteAnswer } from '../../services/discussionService';

const AnswerItem = ({ 
  answer, 
  isBestAnswer, 
  className = '',
  currentUserId,
  isAdmin,
  onUpdate,
  onDelete
}) => {
  const [likeCount, setLikeCount] = useState((answer.upvotes?.length || 0));
  const [liking, setLiking] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(answer.content);
  const [saving, setSaving] = useState(false);

  const handleLike = async () => {
    try {
      setLiking(true);
      const res = await voteAnswer(answer._id, 'up');
      setLikeCount(res.data?.upvotes ?? likeCount);
    } catch (e) {
      // no-op
    } finally {
      setLiking(false);
    }
  };

  const canManage = Boolean(isAdmin && currentUserId && answer.user && answer.user._id === currentUserId);

  const handleSave = async () => {
    if (!editedContent.trim()) return;
    try {
      setSaving(true);
      await (onUpdate && onUpdate(answer._id, editedContent.trim()));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0 ${className}`}>
      <div className="flex items-start">
        <div className="mr-3 h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-medium">
          {(answer.user?.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <span className="font-medium text-gray-900 mr-1">{answer.user?.username || 'Unknown'}</span>
            <span className="mx-1">•</span>
            <span>{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
            {answer.updatedAt !== answer.createdAt && (
              <span className="ml-1 text-gray-400">(edited {formatDistanceToNow(new Date(answer.updatedAt), { addSuffix: true })})</span>
            )}
            {isBestAnswer && (
              <span className="ml-2 inline-flex items-center text-green-600 text-xs font-medium">
                <CheckCircle className="mr-1" size={14} /> Best Answer
              </span>
            )}
          </div>

          {editing ? (
            <div className="prose max-w-none mb-3">
              <textarea
                className="w-full border rounded-md p-3 mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !editedContent.trim()}
                  className={`px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm ${saving || !editedContent.trim() ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditedContent(answer.content); }}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-800 mb-3">
              {answer.content}
            </div>
          )}

          <button
            onClick={handleLike}
            disabled={liking}
            className={`inline-flex items-center px-2 py-1 text-sm rounded-md border ${liking ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'} border-gray-300`}
          >
            <ThumbsUp size={14} className="mr-1" /> Like {likeCount > 0 ? `(${likeCount})` : ''}
          </button>

          {canManage && !editing && (
            <div className="inline-flex items-center gap-2 ml-3 text-sm">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                title="Edit reply"
              >
                <Edit size={14} className="mr-1" /> Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Delete this reply?')) {
                    onDelete && onDelete(answer._id);
                  }
                }}
                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                title="Delete reply"
              >
                <Trash2 size={14} className="mr-1" /> Delete
              </button>
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
  loading = false,
  isAdmin = false
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
            currentUserId={currentUserId}
            isAdmin={isAdmin}
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
              currentUserId={currentUserId}
              isAdmin={isAdmin}
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
