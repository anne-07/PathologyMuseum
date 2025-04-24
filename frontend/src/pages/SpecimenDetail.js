import React, { useState, useEffect, useContext } from 'react';
import '@google/model-viewer';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const SpecimenDetail = () => {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [audioElement, setAudioElement] = useState(null);

  // Mock data - will be replaced with actual API call
  const specimenData = {
    id: 1,
    name: "Uterine Fibroids",
    system: "Female Genital System",
    images: [
      { url: "/specimens/uterine-fibroids-gross.jpg", caption: "Gross appearance", type: "Gross" },
      { url: "/specimens/uterine-fibroids-micro.jpg", caption: "Microscopic view", type: "Microscopic" }
    ],
    audio: [
      { url: "/audio/uterine-fibroids.mp3", caption: "Description audio" }
    ],
    models3d: [
      { url: "/models/uterine-fibroids.glb", caption: "3D Model" }
    ],
    description: "Multiple well-circumscribed, firm nodules within the myometrium, ranging in size from 2-8cm.",
    relatedSpecimens: ["Adenomyosis", "Endometrial Polyp"]
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
  };

  const toggleAudio = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Auth context
  const { isAuthenticated } = useContext(AuthContext);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bookmark status for this specimen
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingBookmark(true);
    const token = localStorage.getItem('token');
    axios.get('/api/bookmarks', {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
    .then(res => {
      const found = res.data.data.find(b => b.specimenId == specimenData.id && b.type === 'specimen');
      if (found) {
        setIsBookmarked(true);
        setBookmarkId(found._id);
        setNote(found.notes || '');
      } else {
        setIsBookmarked(false);
        setBookmarkId(null);
        setNote('');
      }
      setLoadingBookmark(false);
    })
    .catch(() => {
      setError('Failed to load bookmark status');
      setLoadingBookmark(false);
    });
    // eslint-disable-next-line
  }, [isAuthenticated, specimenData.id]);

  const handleBookmark = () => {
    if (!isAuthenticated) return;
    if (isBookmarked) {
      handleDeleteBookmark();
    } else {
      // Add bookmark (show note input first)
      setShowNoteInput(true);
    }
  };

  // Dedicated delete handler for explicit delete button
  const handleDeleteBookmark = () => {
    if (!isAuthenticated) return;
    if (!bookmarkId) {
      setError('No valid bookmark ID for deletion.');
      return;
    }
    setLoadingBookmark(true);
    const token = localStorage.getItem('token');
    axios.delete(`/api/bookmarks/${bookmarkId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
      .then(() => {
        setIsBookmarked(false);
        setBookmarkId(null);
        setShowNoteInput(false);
        setNote('');
        setError(null);
      })
      .catch(() => setError('Failed to remove bookmark'))
      .finally(() => setLoadingBookmark(false));
  };


  const handleSaveNote = () => {
    const token = localStorage.getItem('token');
    axios.post('/api/bookmarks', {
      specimenId: specimenData.id,
      type: 'specimen',
      name: specimenData.name,
      description: specimenData.description,
      imageUrl: specimenData.images?.[0]?.url || '',
      notes: note,
      folder: '',
    }, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    })
      .then(res => {
        setIsBookmarked(true);
        setBookmarkId(res.data.data._id);
        setShowNoteInput(false);
      })
      .catch(() => setError('Failed to save bookmark'));
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{specimenData.name}</h1>
                <p className="text-lg text-gray-600">{specimenData.system}</p>
              </div>
              <div>
                <button
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors focus:outline-none ${isBookmarked ? 'bg-yellow-400 text-gray-900' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                  onClick={handleBookmark}
                >
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
              </div>
            </div>
            {showNoteInput && (
              <div className="mt-4 flex flex-col gap-2">
                <textarea
                  className="border rounded p-2 w-full"
                  placeholder="Add a note (optional)"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                />
                <div className="flex gap-2">
                  <button className="bg-primary-600 text-white px-3 py-1 rounded" onClick={handleSaveNote}>Save</button>
                  <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => setShowNoteInput(false)}>Cancel</button>
                </div>
              </div>
            )}
            {isBookmarked && !showNoteInput && (
              <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                <span>Note: {note}</span>
                <button className="text-primary-600 underline text-xs" onClick={() => setShowNoteInput(true)}>Edit</button>
                <button
                  className="text-red-600 underline text-xs ml-2"
                  onClick={handleDeleteBookmark}
                  disabled={loadingBookmark}
                >
                  {loadingBookmark ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Multimedia section */}
            <div className="bg-white rounded-xl shadow-lg p-4 space-y-6">
              {/* Image Gallery */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Images</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {specimenData.images && specimenData.images.map((img, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <img
                        src={img.url}
                        alt={img.caption || `Image ${idx + 1}`}
                        className="w-full h-auto rounded-lg border border-gray-200"
                        style={{ maxHeight: 250, objectFit: 'contain' }}
                      />
                      <div className="mt-2 text-xs text-gray-600 text-center">
                        {img.caption} {img.type ? <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-500">{img.type}</span> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 3D Models */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">3D Models</h2>
                <div className="space-y-4">
                  {specimenData.models3d && specimenData.models3d.length > 0 ? specimenData.models3d.map((model, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      {/* Use model-viewer if available, else fallback */}
                      <model-viewer src={model.url} alt={model.caption || `3D Model ${idx + 1}`}
                        camera-controls auto-rotate style={{ width: '100%', height: 300, background: '#f3f4f6' }}></model-viewer>
                      <div className="mt-2 text-xs text-gray-600 text-center">{model.caption}</div>
                    </div>
                  )) : <div className="text-sm text-gray-400">No 3D models available.</div>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Audio players */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Audio</h2>
                <div className="space-y-4">
                  {specimenData.audio && specimenData.audio.length > 0 ? specimenData.audio.map((audioObj, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <audio
                        controls
                        src={audioObj.url}
                        className="w-full"
                      />
                      {audioObj.caption && <div className="mt-1 text-xs text-gray-600 text-center">{audioObj.caption}</div>}
                    </div>
                  )) : <div className="text-sm text-gray-400">No audio available.</div>}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700">{specimenData.description}</p>
              </div>

              {/* Related Specimens */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Specimens</h2>
                <div className="flex flex-wrap gap-2">
                  {specimenData.relatedSpecimens.map((specimen, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {specimen}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpecimenDetail;
