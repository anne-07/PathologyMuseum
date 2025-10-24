// import React, { useState, useRef } from 'react';

// export default function SpecimenForm({ specimen, onClose, filterOptions = {} }) {
//   const [form, setForm] = useState({
//     accessionNumber: specimen?.accessionNumber || '',
//     title: specimen?.title || '',
//     description: specimen?.description || '',
//     pathogenesisVideos: specimen?.pathogenesisVideos || [],
//     organ: specimen?.organ || '',
//     system: specimen?.system || '',
//     diseaseCategory: specimen?.diseaseCategory || '',
//     status: specimen?.status || 'published',
//     images: specimen?.images || [],
//     audio: specimen?.audio || [],
//     models3d: specimen?.models3d || [],
//   });
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [uploading, setUploading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // Helper for uploading files to the backend
//   const uploadToBackend = async (file) => {
//     setUploading(true);
//     const formData = new FormData();
//     formData.append('file', file);
//     try {
//       const res = await fetch('http://localhost:5000/api/upload', {
//         method: 'POST',
//         body: formData,
//         credentials: 'include', // if you need cookies/auth
//       });
//       if (!res.ok) throw new Error('Upload failed');
//       const data = await res.json();
//       return data;
//     } catch (err) {
//       setError('File upload failed');
//       return null;
//     } finally {
//       setUploading(false);
//     }
//   };

//   // Helper for deleting files from the backend
//   // Extract Cloudinary public_id from URL if not present
//   const extractPublicIdFromUrl = (url) => {
//     if (typeof url !== 'string') return null;
//     // Matches: .../upload/v12345/folder/filename.ext => folder/filename
//     const matches = url.match(/upload\/(?:v\d+\/)?(.+?)\.[a-zA-Z0-9]+$/);
//     return matches ? matches[1] : null;
//   };


//   const handleDeleteFile = async (public_id, url) => {
//     const idToDelete = public_id || extractPublicIdFromUrl(url);
//     if (!idToDelete) {
//       setError('No public_id found for deletion');
//       return;
//     }
//     try {
//       await fetch('http://localhost:5000/api/upload', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ public_id: idToDelete }),
//       });
//     } catch (err) {
//       setError('File deletion failed');
//     }
//   };

//   // Images
//   const handleImageUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     const uploaded = [];
//     for (const file of files) {
//       const data = await uploadToBackend(file);
//       if (data) {
//         uploaded.push({ url: data.url, public_id: data.public_id, type: 'Gross' });
//       }
//     }
//     setForm(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
//   };

//   // Audio
//   const handleAudioUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     const uploaded = [];
//     for (const file of files) {
//       const data = await uploadToBackend(file);
//       if (data) {
//         uploaded.push({ url: data.url, public_id: data.public_id, caption: file.name });
//       }
//     }
//     setForm(prev => ({ ...prev, audio: [...prev.audio, ...uploaded] }));
//   };

//   // 3D Models
//   const handleModelUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     const uploaded = [];
//     for (const file of files) {
//       const data = await uploadToBackend(file);
//       if (data) {
//         uploaded.push({ url: data.url, public_id: data.public_id, caption: file.name });
//       }
//     }
//     setForm(prev => ({ ...prev, models3d: [...prev.models3d, ...uploaded] }));
//   };

//   // Pathogenesis Videos
//   const handlePathogenesisVideoUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     const uploaded = [];
//     for (const file of files) {
//       const data = await uploadToBackend(file);
//       if (data) {
//         uploaded.push({ url: data.url, public_id: data.public_id, caption: file.name });
//       }
//     }
//     setForm(prev => ({ ...prev, pathogenesisVideos: [...prev.pathogenesisVideos, ...uploaded] }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     setError(null);
//     try {
//       const method = specimen ? 'PATCH' : 'POST';
//       const url = specimen ? `/api/specimens/${specimen._id}` : '/api/specimens';
//       const token = localStorage.getItem('token');
//       const res = await fetch(url, {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token ? { Authorization: `Bearer ${token}` } : {})
//         },
//         credentials: 'include',
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) throw new Error('Failed to save specimen');
//       onClose();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
//       <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
//         <h3 className="text-lg font-semibold mb-4">{specimen ? 'Edit Specimen' : 'Add New Specimen'}</h3>
//         {error && <div className="text-red-500 mb-2">{error}</div>}
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-1">Accession Number</label>
//           <input name="accessionNumber" value={form.accessionNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
//         </div>
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-1">Title</label>
//           <input name="title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
//         </div>
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-1">Description</label>
//           <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
//         </div>
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-2">Pathogenesis Videos</label>
//           <div className="border border-dashed border-gray-300 rounded-lg p-4">
//             <div className="text-center">
//               <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded inline-flex items-center">
//                 <span>Upload Pathogenesis Videos</span>
//                 <input 
//                   type="file" 
//                   accept="video/*" 
//                   multiple 
//                   onChange={handlePathogenesisVideoUpload} 
//                   disabled={uploading} 
//                   className="hidden"
//                 />
//               </label>
//               <p className="text-xs text-gray-500 mt-2">Upload one or more videos related to pathogenesis</p>
//             </div>
            
//             <div className="mt-4 grid grid-cols-1 gap-3">
//               {form.pathogenesisVideos.map((video, i) => (
//                 <div key={i} className="relative group bg-gray-50 p-3 rounded border">
//                   <div className="flex items-start">
//                     <video 
//                       src={video.url} 
//                       controls 
//                       className="w-48 h-32 object-cover rounded"
//                       title={video.caption || `Pathogenesis Video ${i+1}`}
//                     />
//                     <div className="ml-3 flex-1">
//                       <input
//                         type="text"
//                         value={video.caption}
//                         onChange={(e) => {
//                           const updatedVideos = [...form.pathogenesisVideos];
//                           updatedVideos[i] = { ...updatedVideos[i], caption: e.target.value };
//                           setForm(prev => ({ ...prev, pathogenesisVideos: updatedVideos }));
//                         }}
//                         placeholder="Enter video caption"
//                         className="w-full text-sm border rounded px-2 py-1 mb-2"
//                       />
//                       <button
//                         type="button"
//                         className="text-red-600 hover:text-red-800 text-sm flex items-center"
//                         onClick={async () => {
//                           await handleDeleteFile(video.public_id, video.url);
//                           setForm(prev => ({
//                             ...prev,
//                             pathogenesisVideos: prev.pathogenesisVideos.filter((_, idx) => idx !== i)
//                           }));
//                         }}
//                       >
//                         <span className="mr-1">×</span> Remove Video
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-1">Organ</label>
//           <input name="organ" value={form.organ} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Organ" required />
//         </div>
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-1">System</label>
//           <input name="system" value={form.system} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="System" required />
//         </div>
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-1"> Disease Category</label>
//           <input name="diseaseCategory" value={form.diseaseCategory} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Disease Category" required />
//         </div>
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-1">Status</label>
//           <select name="status" value={form.status} onChange={handleChange} className="w-full border rounded px-3 py-2">
//             <option value="published">Published</option>
//             <option value="draft">Draft</option>
//           </select>
//         </div>
//         {/* Image Upload */}
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-1">Images</label>
//           <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading} />
//           <div className="flex flex-wrap mt-2">
//             {form.images.map((img, i) => (
//               <div key={i} className="mr-2 mb-2 relative group">
//                 <img src={img.url} alt="" className="h-16 w-16 object-cover rounded" />
//                 <button
//                   type="button"
//                   className="absolute top-0 right-0 bg-white border border-red-500 text-red-600 rounded-full p-2 text-2xl font-bold shadow hover:bg-red-500 hover:text-white transition z-10"
//                   onClick={async () => {
//                     await handleDeleteFile(img.public_id, img.url);
//                     setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
//                   }}
//                   aria-label="Remove image"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Audio Upload */}
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-1">Audio Files</label>
//           <input type="file" accept="audio/*" multiple onChange={handleAudioUpload} disabled={uploading} />
//           <div className="flex flex-wrap mt-2">
//             {form.audio.map((audio, i) => (
//               <div key={i} className="mr-2 mb-2 flex items-center relative group">
//                 <audio src={audio.url} controls className="h-8" />
//                 <span className="ml-2 text-xs">{audio.caption || `Audio ${i+1}`}</span>
//                 <button
//                   type="button"
//                   className="absolute -top-2 -right-2 bg-white border border-red-500 text-red-600 rounded-full p-1 text-lg font-bold shadow hover:bg-red-500 hover:text-white transition z-10"
//                   onClick={async () => {
//                     await handleDeleteFile(audio.public_id, audio.url);
//                     setForm(prev => ({ ...prev, audio: prev.audio.filter((_, idx) => idx !== i) }));
//                   }}
//                   aria-label="Remove audio"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* 3D Model Upload */}
//         <div className="mb-3">
//           <label className="block text-sm font-medium mb-1">3D Models</label>
//           <input type="file" accept=".glb,.gltf,.obj,.fbx" multiple onChange={handleModelUpload} disabled={uploading} />
//           <div className="flex flex-wrap mt-2">
//             {form.models3d.map((model, i) => (
//               <div key={i} className="mr-2 mb-2 flex items-center relative group">
//                 <span className="inline-block w-8 h-8 bg-gray-200 rounded text-center leading-8">3D</span>
//                 <span className="ml-2 text-xs">{model.caption || `Model ${i+1}`}</span>
//                 <button
//                   type="button"
//                   className="absolute -top-2 -right-2 bg-white border border-red-500 text-red-600 rounded-full p-1 text-lg font-bold shadow hover:bg-red-500 hover:text-white transition z-10"
//                   onClick={async () => {
//                     await handleDeleteFile(model.public_id, model.url);
//                     setForm(prev => ({ ...prev, models3d: prev.models3d.filter((_, idx) => idx !== i) }));
//                   }}
//                   aria-label="Remove 3D model"
//                 >
//                   ×
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>


//         <div className="flex justify-end mt-6 gap-2">
//           <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Cancel</button>
//           <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white" disabled={saving}>{saving ? 'Saving...' : (specimen ? 'Update' : 'Add')}</button>
//         </div>
//       </form>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { FiUploadCloud, FiX, FiFile, FiFilm, FiMic, FiBox } from 'react-icons/fi';
import Select from 'react-select';

const FileInput = ({ id, label, accept, multiple, onChange, disabled }) => (
  <div className="w-full">
    <label htmlFor={id} className="w-full text-center cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 px-4 rounded-md border border-dashed border-gray-300 transition">
      {label}
    </label>
    <input id={id} type="file" accept={accept} multiple={multiple} onChange={onChange} disabled={disabled} className="hidden" />
  </div>
);

const MediaPreview = ({ file, onRemove, onCaptionChange, type }) => {
  const renderPreview = () => {
    switch (type) {
      case 'image':
        return <img src={file.url} alt={file.caption || 'preview'} className="w-full h-24 object-cover rounded-md" />;
      case 'video':
        return <video src={file.url} controls className="w-full h-24 object-cover rounded-md" />;
      case 'audio':
        return <audio src={file.url} controls className="w-full" />;
      case 'model':
        return <div className="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center"><FiBox size={32} className="text-gray-500" /></div>;
      default:
        return <div className="w-full h-24 bg-gray-200 rounded-md flex items-center justify-center"><FiFile size={32} className="text-gray-500" /></div>;
    }
  };

  return (
    <div className="relative group bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
      {renderPreview()}
      <input
        type="text"
        value={file.caption || ''}
        onChange={onCaptionChange}
        placeholder="Enter caption"
        className="w-full text-sm border-t mt-2 pt-1 px-1 border-gray-200 rounded-b-md focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-transform transform group-hover:scale-110"
      >
        <FiX size={14} />
      </button>
    </div>
  );
};

export default function SpecimenForm({ specimen, onClose, filterOptions = {} }) {
  const [form, setForm] = useState({
    title: specimen?.title || '',
    description: specimen?.description || '',
    pathogenesisVideos: specimen?.pathogenesisVideos || [],
    organ: specimen?.organ ? { value: specimen.organ, label: specimen.organ } : null,
    system: specimen?.system ? { value: specimen.system, label: specimen.system } : null,
    diseaseCategory: specimen?.diseaseCategory ? { value: specimen.diseaseCategory, label: specimen.diseaseCategory } : null,
    status: specimen?.status || 'published',
    images: specimen?.images || [],
    audio: specimen?.audio || [],
    models3d: specimen?.models3d || [],
  });

  // State for dropdown options
  const [dropdownOptions, setDropdownOptions] = useState({
    organs: [],
    systems: [],
    diseaseCategories: [],
    loading: true,
    error: null
  });

  // Fetch filter options from backend
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        console.log('Starting to fetch filter options...');

        // Now fetch all filter options at once
        const urls = [
          'http://localhost:5000/api/filter-options?type=organ',
          'http://localhost:5000/api/filter-options?type=system',
          'http://localhost:5000/api/filter-options?type=diseaseCategory'
        ];

        console.log('Fetching from URLs:', urls);
        
        const responses = await Promise.all(urls.map(url => 
          fetch(url).then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
          })
        ));

        console.log('API responses:', responses);

        // Check if we got responses for all endpoints
        if (responses.length !== 3) {
          throw new Error('Did not receive all expected responses');
        }

        const [organsData, systemsData, diseaseCategoriesData] = responses;

        // Log the raw data structure
        console.log('Raw data from API:', {
          organs: organsData,
          systems: systemsData,
          diseaseCategories: diseaseCategoriesData
        });

        // Try different response formats
        const processOptions = (data) => {
          // Try different possible response formats
          return (
            data.data?.options ||  // Format: { data: { options: [...] } }
            data.options ||        // Format: { options: [...] }
            data.data ||           // Format: { data: [...] }
            data || []             // Format: [...]
          );
        };

        const organs = processOptions(organsData);
        const systems = processOptions(systemsData);
        const diseaseCategories = processOptions(diseaseCategoriesData);

        console.log('Processed options:', {
          organs,
          systems,
          diseaseCategories
        });

        const mapToSelectOptions = (items) => {
          if (!Array.isArray(items)) return [];
          return items.map(item => ({
            value: item.value || item.name || item,
            label: item.label || item.name || item.value || item
          }));
        };

        setDropdownOptions({
          organs: mapToSelectOptions(organs),
          systems: mapToSelectOptions(systems),
          diseaseCategories: mapToSelectOptions(diseaseCategories),
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching filter options:', {
          error,
          message: error.message,
          stack: error.stack
        });
        setDropdownOptions(prev => ({
          ...prev,
          error: `Failed to load filter options: ${error.message}`,
          loading: false
        }));
      }
    };

    fetchFilterOptions();
  }, []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setForm({ ...form, [name]: selectedOption });
  };

  const uploadToBackend = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Upload failed');
      return await res.json();
    } catch (err) {
      setError('File upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const extractPublicIdFromUrl = (url) => {
    if (typeof url !== 'string') return null;
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

  const handleFileUpload = (field) => async (e) => {
    const files = Array.from(e.target.files);
    const uploaded = [];
    for (const file of files) {
      const data = await uploadToBackend(file);
      if (data) {
        uploaded.push({ url: data.url, public_id: data.public_id, caption: file.name });
      }
    }
    setForm(prev => ({ ...prev, [field]: [...prev[field], ...uploaded] }));
  };

  const handleFileRemove = (field, index, file) => async () => {
    await handleDeleteFile(file.public_id, file.url);
    setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleCaptionChange = (field, index) => (e) => {
    const updatedFiles = [...form[field]];
    updatedFiles[index] = { ...updatedFiles[index], caption: e.target.value };
    setForm(prev => ({ ...prev, [field]: updatedFiles }));
  };

  const isFormValid = () => {
    return (
      form.title.trim() !== '' &&
      form.description.trim() !== '' &&
      form.organ !== null &&
      form.system !== null &&
      form.diseaseCategory !== null
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check form validity
    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      // Prepare the data for submission
      const submissionData = {
        ...form,
        organ: form.organ?.value || '',
        system: form.system?.value || '',
        diseaseCategory: form.diseaseCategory?.value || '',
      };

      const method = specimen ? 'PATCH' : 'POST';
      const url = specimen ? `/api/specimens/${specimen._id}` : '/api/specimens';
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(submissionData),
      });
      if (!res.ok) throw new Error('Failed to save specimen');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderMediaSection = (title, field, accept, type, icon) => (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <h4 className="font-semibold text-gray-700 mb-3 flex items-center">{icon} {title}</h4>
      <FileInput
        id={`${field}-upload`}
        label={`Upload ${title}`}
        accept={accept}
        multiple
        onChange={handleFileUpload(field)}
        disabled={uploading}
      />
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {form[field].map((file, i) => (
          <MediaPreview
            key={i}
            file={file}
            onRemove={handleFileRemove(field, i, file)}
            onCaptionChange={handleCaptionChange(field, i)}
            type={type}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {dropdownOptions.error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
            <p>{dropdownOptions.error}</p>
          </div>
        )}
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h3 className="text-2xl font-bold text-gray-800">{specimen ? 'Edit Specimen' : 'Add New Specimen'}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Title <span className="text-red-500">*</span></label>
              <input 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
                className={`w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${!form.title.trim() && error ? 'border-red-500' : ''}`} 
                placeholder="Enter specimen title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={handleChange} 
                rows="10" 
                className={`w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 ${!form.description.trim() && error ? 'border-red-500' : ''}`}
                placeholder="Enter specimen description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Organ <span className="text-red-500">*</span></label>
                <Select
                  name="organ"
                  value={form.organ}
                  onChange={handleSelectChange}
                  options={dropdownOptions.organs}
                  className="text-sm"
                  placeholder={dropdownOptions.loading ? 'Loading organs...' : 'Select organ...'}
                  isSearchable
                  isClearable
                  isLoading={dropdownOptions.loading}
                  isDisabled={dropdownOptions.loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">System <span className="text-red-500">*</span></label>
                <Select
                  name="system"
                  value={form.system}
                  onChange={handleSelectChange}
                  options={dropdownOptions.systems}
                  className="text-sm"
                  placeholder={dropdownOptions.loading ? 'Loading systems...' : 'Select system...'}
                  isSearchable
                  isClearable
                  isLoading={dropdownOptions.loading}
                  isDisabled={dropdownOptions.loading}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Disease Category <span className="text-red-500">*</span></label>
              <Select
                name="diseaseCategory"
                value={form.diseaseCategory}
                onChange={handleSelectChange}
                options={dropdownOptions.diseaseCategories}
                className="text-sm"
                placeholder={dropdownOptions.loading ? 'Loading categories...' : 'Select disease category...'}
                isSearchable
                isClearable
                isLoading={dropdownOptions.loading}
                isDisabled={dropdownOptions.loading}
                required
              />
            </div>
          </div>

          {/* Right Column for Media */}
          <div className="space-y-4">
            {renderMediaSection('Images', 'images', 'image/*', 'image', <FiUploadCloud className="mr-2" />)}
            {renderMediaSection('Pathogenesis Videos', 'pathogenesisVideos', 'video/*', 'video', <FiFilm className="mr-2" />)}
            {renderMediaSection('Audio Files', 'audio', 'audio/*', 'audio', <FiMic className="mr-2" />)}
            {renderMediaSection('3D Models', 'models3d', '.glb,.gltf,.obj,.fbx', 'model', <FiBox className="mr-2" />)}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                className="px-5 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold transition" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving || !isFormValid()} 
                className={`px-5 py-2 rounded-md font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  saving || !isFormValid() 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
                }`}
              >
                {saving ? 'Saving...' : 'Save Specimen'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}