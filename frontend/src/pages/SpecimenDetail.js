import React, { useState, useEffect, useContext, useRef } from 'react';
import ImageModal from '../components/ImageModal';
import '@google/model-viewer';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  MagnifyingGlassIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Fullscreen wrapper for <model-viewer> with built-in pan
function ModelViewerFullscreen({ url, caption }) {
  const containerRef = useRef(null);
  const modelRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Toggle fullscreen for the container
  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!fullscreen) {
      if (!el) return;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };


  // Listen for fullscreen change
  useEffect(() => {
    function onFullscreenChange() {
      const isFull = !!document.fullscreenElement;
      setFullscreen(isFull);
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={fullscreen ? "fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center" : "w-full flex flex-col items-center"}
      style={fullscreen ? { cursor: 'grab' } : {}}
    >
      <div style={{ position: 'relative', width: fullscreen ? '80vw' : '100%', height: fullscreen ? '80vh' : 300 }}>
        <model-viewer
          ref={modelRef}
          src={url}
          alt={caption}
          camera-controls
          auto-rotate
          style={{ width: '100%', height: '100%', background: '#f3f4f6' }}
          interaction-prompt="none"
        ></model-viewer>
        <button
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-2 shadow-md focus:outline-none"
          title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          style={{ zIndex: 2 }}
        >
          {fullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18v2a2 2 0 002 2h2m4 0h2a2 2 0 002-2v-2m0-8V6a2 2 0 00-2-2h-2m-4 0H8a2 2 0 00-2 2v2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2" />
            </svg>
          )}
        </button>
        {fullscreen && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs bg-black bg-opacity-70 text-white px-3 py-1 rounded-md pointer-events-none">
            Pan with right mouse or two-finger drag. Press Esc to exit fullscreen.
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-600 text-center">{caption}</div>
    </div>
  );
}


const SpecimenDetail = () => {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  // Image modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

  // State for real specimen data
  const [specimen, setSpecimen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Fetch specimen data from backend
  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    axios.get(`/api/specimens/${id}`)
      .then(res => {
        setSpecimen(res.data.data.specimen);
        setLoading(false);
      })
      .catch(err => {
        setFetchError('Failed to load specimen data');
        setLoading(false);
      });
  }, [id]);

  // Track recently viewed specimens in localStorage
  useEffect(() => {
    if (!id) return;
    let viewed = [];
    try {
      viewed = JSON.parse(localStorage.getItem('recentlyViewedSpecimens') || '[]');
    } catch (e) { viewed = []; }
    viewed = viewed.filter(x => x !== id);
    viewed.unshift(id);
    if (viewed.length > 10) viewed = viewed.slice(0, 10);
    localStorage.setItem('recentlyViewedSpecimens', JSON.stringify(viewed));
  }, [id]);

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
  const { isAuthenticated } = useAuth();
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
      const found = res.data.data.find(b => b.specimenId == id && b.type === 'specimen');
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
  }, [isAuthenticated, id]);

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
      specimenId: specimen._id,
      type: 'specimen',
      name: specimen?.title || specimen?.name,
      description: specimen?.description,
      imageUrl: specimen?.images?.[0]?.url || '',
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

  if (loading) return <div className="flex justify-center items-center h-64">Loading specimen...</div>;
  if (fetchError) return <div className="text-red-500 text-center mt-8">{fetchError}</div>;
  if (!specimen) return <div className="text-gray-500 text-center mt-8">Specimen not found.</div>;

  return (
    <>
      <div 
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNqFwIGdpTGUCWoP0guScSloZf6-0N7D6_XDUYu0fzn5epIZzI1R1WvXUvfRDpQ7H95OU&usqp=CAU')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <ImageModal open={modalOpen} src={modalImg?.src} alt={modalImg?.alt} onClose={() => setModalOpen(false)} />
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{specimen.title || specimen.name}</h1>
                <p className="text-lg text-gray-200">{specimen.system}</p>
              </div>
              <div>
                <button
                  className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors focus:outline-none ${isBookmarked ? 'bg-yellow-400 text-gray-900' : 'border border-white text-white bg-transparent hover:bg-white hover:text-gray-900'}`}
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
                  {(specimen.images || []).map((img, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <img
                        src={img.url}
                        alt={img.caption || `Image ${idx + 1}`}
                        className="w-full h-auto rounded-lg border border-gray-200 cursor-zoom-in hover:shadow-lg transition"
                        style={{ maxHeight: 250, objectFit: 'contain' }}
                        onClick={() => {
                          setModalImg({ src: img.url, alt: img.caption || `Image ${idx + 1}` });
                          setModalOpen(true);
                        }}
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setModalImg({ src: img.url, alt: img.caption || `Image ${idx + 1}` });
                            setModalOpen(true);
                          }
                        }}
                        aria-label="Zoom image"
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
                  {(specimen.models3d && specimen.models3d.length > 0) ? specimen.models3d.map((model, idx) => (
  <ModelViewerFullscreen key={idx} url={model.url} caption={model.caption || `3D Model ${idx + 1}`} />
)) : <div className="text-sm text-gray-400">No 3D models available.</div>}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Audio players */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Audio</h2>
                <div className="space-y-4">
                  {(specimen.audio && specimen.audio.length > 0) ? specimen.audio.map((audioObj, idx) => (
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
                <div className="text-gray-700" style={{ whiteSpace: 'pre-line' }}>{specimen.description}</div>
              </div>

              {/* Pathogenesis Videos */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pathogenesis</h2>
                <div className="space-y-4">
                  {(specimen.pathogenesisVideos && specimen.pathogenesisVideos.length > 0) ? (
                    specimen.pathogenesisVideos.map((video, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <video
                          src={video.url}
                          controls
                          className="w-full"
                          title={video.caption || `Pathogenesis Video ${idx + 1}`}
                        />
                        {video.caption && (
                          <div className="p-3 text-sm text-gray-700">
                            {video.caption}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-400">No pathogenesis videos available.</div>
                  )}
                </div>
              </div>

              {/* Related Specimens */}
              {(specimen.relatedSpecimens && specimen.relatedSpecimens.length > 0) && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Specimens</h2>
                  <div className="flex flex-wrap gap-2">
                    {specimen.relatedSpecimens.map((relSpecimen, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {relSpecimen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SpecimenDetail;
