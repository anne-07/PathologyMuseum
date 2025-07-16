import React, { useState, useRef } from 'react';

export default function SpecimenForm({ specimen, onClose, filterOptions = {} }) {
  const [form, setForm] = useState({
    accessionNumber: specimen?.accessionNumber || '',
    title: specimen?.title || '',
    description: specimen?.description || '',
    pathogenesisVideos: specimen?.pathogenesisVideos || [],
    organ: specimen?.organ || '',
    system: specimen?.system || '',
    diseaseCategory: specimen?.diseaseCategory || '',
    status: specimen?.status || 'published',
    images: specimen?.images || [],
    audio: specimen?.audio || [],
    models3d: specimen?.models3d || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Helper for uploading files to the backend
  const uploadToBackend = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // if you need cookies/auth
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data;
    } catch (err) {
      setError('File upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Helper for deleting files from the backend
  // Extract Cloudinary public_id from URL if not present
  const extractPublicIdFromUrl = (url) => {
    if (typeof url !== 'string') return null;
    // Matches: .../upload/v12345/folder/filename.ext => folder/filename
    const matches = url.match(/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
    return matches ? matches[1] : null;
  };


  const handleDeleteFile = async (public_id, url) => {
    const idToDelete = public_id || extractPublicIdFromUrl(url);
    if (!idToDelete) {
      setError('No public_id found for deletion');
      return;
    }
    try {
      await fetch('http://localhost:5000/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id: idToDelete }),
      });
    } catch (err) {
      setError('File deletion failed');
    }
  };

  // Images
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];
    for (const file of files) {
      const data = await uploadToBackend(file);
      if (data) {
        uploaded.push({ url: data.url, public_id: data.public_id, type: 'Gross' });
      }
    }
    setForm(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
  };

  // Audio
  const handleAudioUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];
    for (const file of files) {
      const data = await uploadToBackend(file);
      if (data) {
        uploaded.push({ url: data.url, public_id: data.public_id, caption: file.name });
      }
    }
    setForm(prev => ({ ...prev, audio: [...prev.audio, ...uploaded] }));
  };

  // 3D Models
  const handleModelUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];
    for (const file of files) {
      const data = await uploadToBackend(file);
      if (data) {
        uploaded.push({ url: data.url, public_id: data.public_id, caption: file.name });
      }
    }
    setForm(prev => ({ ...prev, models3d: [...prev.models3d, ...uploaded] }));
  };

  // Pathogenesis Videos
  const handlePathogenesisVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];
    for (const file of files) {
      const data = await uploadToBackend(file);
      if (data) {
        uploaded.push({ url: data.url, public_id: data.public_id, caption: file.name });
      }
    }
    setForm(prev => ({ ...prev, pathogenesisVideos: [...prev.pathogenesisVideos, ...uploaded] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const method = specimen ? 'PATCH' : 'POST';
      const url = specimen ? `/api/specimens/${specimen._id}` : '/api/specimens';
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save specimen');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{specimen ? 'Edit Specimen' : 'Add New Specimen'}</h3>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Accession Number</label>
          <input name="accessionNumber" value={form.accessionNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-2">Pathogenesis Videos</label>
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded inline-flex items-center">
                <span>Upload Pathogenesis Videos</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  multiple 
                  onChange={handlePathogenesisVideoUpload} 
                  disabled={uploading} 
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">Upload one or more videos related to pathogenesis</p>
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-3">
              {form.pathogenesisVideos.map((video, i) => (
                <div key={i} className="relative group bg-gray-50 p-3 rounded border">
                  <div className="flex items-start">
                    <video 
                      src={video.url} 
                      controls 
                      className="w-48 h-32 object-cover rounded"
                      title={video.caption || `Pathogenesis Video ${i+1}`}
                    />
                    <div className="ml-3 flex-1">
                      <input
                        type="text"
                        value={video.caption}
                        onChange={(e) => {
                          const updatedVideos = [...form.pathogenesisVideos];
                          updatedVideos[i] = { ...updatedVideos[i], caption: e.target.value };
                          setForm(prev => ({ ...prev, pathogenesisVideos: updatedVideos }));
                        }}
                        placeholder="Enter video caption"
                        className="w-full text-sm border rounded px-2 py-1 mb-2"
                      />
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 text-sm flex items-center"
                        onClick={async () => {
                          await handleDeleteFile(video.public_id, video.url);
                          setForm(prev => ({
                            ...prev,
                            pathogenesisVideos: prev.pathogenesisVideos.filter((_, idx) => idx !== i)
                          }));
                        }}
                      >
                        <span className="mr-1">×</span> Remove Video
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Organ</label>
          <input name="organ" value={form.organ} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Organ" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">System</label>
          <input name="system" value={form.system} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="System" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1"> Disease Category</label>
          <input name="diseaseCategory" value={form.diseaseCategory} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Disease Category" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        {/* Image Upload */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Images</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
          <div className="flex flex-wrap mt-2">
            {form.images.map((img, i) => (
              <div key={i} className="mr-2 mb-2 relative group">
                <img src={img.url} alt="" className="h-16 w-16 object-cover rounded" />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-white border border-red-500 text-red-600 rounded-full p-2 text-2xl font-bold shadow hover:bg-red-500 hover:text-white transition z-10"
                  onClick={async () => {
                    await handleDeleteFile(img.public_id, img.url);
                    setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
                  }}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Upload */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Audio Files</label>
          <input type="file" accept="audio/*" multiple onChange={handleAudioUpload} disabled={uploading} />
          <div className="flex flex-wrap mt-2">
            {form.audio.map((audio, i) => (
              <div key={i} className="mr-2 mb-2 flex items-center relative group">
                <audio src={audio.url} controls className="h-8" />
                <span className="ml-2 text-xs">{audio.caption || `Audio ${i+1}`}</span>
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-white border border-red-500 text-red-600 rounded-full p-1 text-lg font-bold shadow hover:bg-red-500 hover:text-white transition z-10"
                  onClick={async () => {
                    await handleDeleteFile(audio.public_id, audio.url);
                    setForm(prev => ({ ...prev, audio: prev.audio.filter((_, idx) => idx !== i) }));
                  }}
                  aria-label="Remove audio"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Model Upload */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">3D Models</label>
          <input type="file" accept=".glb,.gltf,.obj,.fbx" multiple onChange={handleModelUpload} disabled={uploading} />
          <div className="flex flex-wrap mt-2">
            {form.models3d.map((model, i) => (
              <div key={i} className="mr-2 mb-2 flex items-center relative group">
                <span className="inline-block w-8 h-8 bg-gray-200 rounded text-center leading-8">3D</span>
                <span className="ml-2 text-xs">{model.caption || `Model ${i+1}`}</span>
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-white border border-red-500 text-red-600 rounded-full p-1 text-lg font-bold shadow hover:bg-red-500 hover:text-white transition z-10"
                  onClick={async () => {
                    await handleDeleteFile(model.public_id, model.url);
                    setForm(prev => ({ ...prev, models3d: prev.models3d.filter((_, idx) => idx !== i) }));
                  }}
                  aria-label="Remove 3D model"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>


        <div className="flex justify-end mt-6 gap-2">
          <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white" disabled={saving}>{saving ? 'Saving...' : (specimen ? 'Update' : 'Add')}</button>
        </div>
      </form>
    </div>
  );
}
