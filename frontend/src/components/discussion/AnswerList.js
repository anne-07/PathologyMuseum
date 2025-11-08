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
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
          {(answer.user?.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-3">
            <span className="font-semibold text-gray-900">{answer.user?.username || 'Unknown'}</span>
            {answer.user?.role === 'admin' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                Admin
              </span>
            )}
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-500">{formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
            {answer.updatedAt !== answer.createdAt && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-xs text-gray-400">edited {formatDistanceToNow(new Date(answer.updatedAt), { addSuffix: true })}</span>
              </>
            )}
            {isBestAnswer && (
              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                <CheckCircle className="mr-1" size={12} /> Best Answer
              </span>
            )}
          </div>

          {editing ? (
            <div className="mb-4">
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !editedContent.trim()}
                  className={`px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors ${
                    saving || !editedContent.trim() 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:bg-primary-700'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditedContent(answer.content); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
              {answer.content}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`inline-flex items-center px-3 py-1.5 text-sm rounded-lg border font-medium transition-colors ${
                liking 
                  ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
              }`}
            >
              <ThumbsUp size={16} className="mr-1.5" /> 
              Like {likeCount > 0 && `(${likeCount})`}
            </button>

            {canManage && !editing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  title="Edit reply"
                >
                  <Edit size={14} className="mr-1.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this reply?')) {
                      onDelete && onDelete(answer._id);
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-white text-red-600 hover:bg-red-50 font-medium transition-colors"
                  title="Delete reply"
                >
                  <Trash2 size={14} className="mr-1.5" /> Delete
                </button>
              </div>
            )}
          </div>
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
      <div className="text-center py-12 text-gray-500">
        <MessageSquare size={32} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-600 font-medium">No answers yet</p>
        <p className="text-sm text-gray-400 mt-1">Be the first to answer this question!</p>
      </div>
    );
  }

  // Separate best answer (if exists) from other answers
  const bestAnswer = bestAnswerId ? answers.find(a => a._id === bestAnswerId) : null;
  const otherAnswers = answers.filter(a => !bestAnswerId || a._id !== bestAnswerId);

  return (
    <div>
      {/* Best Answer */}
      {bestAnswer && (
        <div className="mb-6 pb-6 border-b-2 border-green-200">
          <div className="flex items-center text-green-700 font-semibold mb-4">
            <CheckCircle className="mr-2" size={18} />
            <span>Best Answer</span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
        </div>
      )}

      {/* Other Answers */}
      {otherAnswers.length > 0 && (
        <div>
          {bestAnswer && (
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Other Answers
            </h3>
          )}
          <div>
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
        </div>
      )}
    </div>
  );
};

export default AnswerList;
