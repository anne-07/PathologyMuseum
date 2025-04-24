import React, { useState } from 'react';

export default function SpecimenForm({ specimen, onClose, filterOptions = {} }) {
  const [form, setForm] = useState({
    accessionNumber: specimen?.accessionNumber || '',
    title: specimen?.title || '',
    description: specimen?.description || '',
    organ: specimen?.organ || '',
    system: specimen?.system || '',
    diagnosis: specimen?.diagnosis || '',
    category: specimen?.category || '',
    status: specimen?.status || 'published',
    images: specimen?.images || [],
    audio: specimen?.audio || [],
    models3d: specimen?.models3d || [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Cloudinary config
  const CLOUDINARY_UPLOAD_PRESET = 'YOUR_UPLOAD_PRESET'; // TODO: Replace with your preset
  const CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME'; // TODO: Replace with your cloud name

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Helper for uploading files to Cloudinary
  const uploadToCloudinary = async (file, resourceType = 'auto') => {
    setUploading(true);
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      setError('Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];
    for (const file of files) {
      const url = await uploadToCloudinary(file, 'image');
      if (url) uploaded.push({ url, type: 'Gross' });
    }
    setForm(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
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
          <label className="block text-sm font-medium mb-1">Organ</label>
          <input name="organ" value={form.organ} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Organ" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">System</label>
          <input name="system" value={form.system} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="System" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Category</label>
          <input name="category" value={form.category} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Category" required />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Diagnosis</label>
          <input name="diagnosis" value={form.diagnosis} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Diagnosis" required />
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
              <div key={i} className="mr-2 mb-2">
                <img src={img.url} alt="" className="h-16 w-16 object-cover rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Audio Upload */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Audio Files</label>
          <input type="file" accept="audio/*" multiple onChange={async (e) => {
            const files = Array.from(e.target.files);
            const uploaded = [];
            for (const file of files) {
              const url = await uploadToCloudinary(file, 'audio');
              if (url) uploaded.push({ url, caption: file.name });
            }
            setForm(prev => ({ ...prev, audio: [...prev.audio, ...uploaded] }));
          }} disabled={uploading} />
          <div className="flex flex-wrap mt-2">
            {form.audio.map((audio, i) => (
              <div key={i} className="mr-2 mb-2 flex items-center">
                <audio src={audio.url} controls className="h-8" />
                <span className="ml-2 text-xs">{audio.caption || `Audio ${i+1}`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Model Upload */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">3D Models</label>
          <input type="file" accept=".glb,.gltf,.obj,.fbx" multiple onChange={async (e) => {
            const files = Array.from(e.target.files);
            const uploaded = [];
            for (const file of files) {
              const url = await uploadToCloudinary(file, 'auto');
              if (url) uploaded.push({ url, caption: file.name });
            }
            setForm(prev => ({ ...prev, models3d: [...prev.models3d, ...uploaded] }));
          }} disabled={uploading} />
          <div className="flex flex-wrap mt-2">
            {form.models3d.map((model, i) => (
              <div key={i} className="mr-2 mb-2 flex items-center">
                <span className="inline-block w-8 h-8 bg-gray-200 rounded text-center leading-8">3D</span>
                <span className="ml-2 text-xs">{model.caption || `Model ${i+1}`}</span>
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
