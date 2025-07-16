import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Bookmarks() {
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    axios.get('/api/bookmarks', {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
      .then(res => {
        setBookmarks(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load bookmarks');
        setLoading(false);
      });
  }, [isAuthenticated]);

  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    axios.delete(`/api/bookmarks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
      .then(() => {
        setBookmarks(bookmarks.filter(b => b._id !== id));
      })
      .catch(() => setError('Failed to delete bookmark'));
  };

  const handleEdit = (id, note) => {
    setEditingId(id);
    setEditNote(note);
  };

  const handleSaveNote = (bookmark) => {
    const token = localStorage.getItem('token');
    axios.post('/api/bookmarks', {
      ...bookmark,
      notes: editNote
    }, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
      .then(res => {
        setBookmarks(bookmarks.map(b =>
          b._id === bookmark._id ? { ...b, notes: editNote } : b
        ));
        setEditingId(null);
      })
      .catch(() => setError('Failed to update note'));
  };

  if (!isAuthenticated) return <div className="p-8">Please log in to view your bookmarks.</div>;
  if (loading) return <div className="p-8">Loading bookmarks...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Your Bookmarks
            </h2>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.length === 0 && <div className="text-gray-500">No bookmarks yet.</div>}
          {bookmarks.map((bookmark) => {
            // Use correct ID for navigation: specimenId for specimens, slideId for slides (if present), fallback to .id
            let detailId = bookmark.type === 'specimen' ? bookmark.specimenId : (bookmark.slideId || bookmark.specimenId || bookmark._id);
            return (
              <Link
                key={bookmark._id}
                className="relative flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white hover:shadow-lg transition-shadow"
              >
                <Link
                  to={bookmark.type === 'specimen' ? `/specimens/${bookmark.specimenId}` : `/slides/${bookmark.specimenId}`}
                  key={bookmark.specimenId}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="aspect-w-3 aspect-h-2 bg-gray-200">
                    <img
                      src={bookmark.imageUrl}
                      alt={bookmark.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                        {bookmark.folder}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:underline">
                    {bookmark.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{bookmark.description}</p>
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                    <p className="mt-1 text-sm text-gray-500">{bookmark.notes || 'No notes'}</p>
                    <span className="text-xs text-gray-400">(Edit/delete in detail page)</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
