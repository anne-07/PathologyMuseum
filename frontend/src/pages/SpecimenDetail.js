import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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
    imageUrl: "/specimens/uterine-fibroids.jpg",
    audioUrl: "/audio/uterine-fibroids.mp3",
    description: "Multiple well-circumscribed, firm nodules within the myometrium, ranging in size from 2-8cm.",
    clinicalCorrelation: "Common benign tumors that can cause menorrhagia, pelvic pain, and reproductive dysfunction.",
    microscopicFindings: "Whorled pattern of smooth muscle bundles with varying amounts of intervening collagen.",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{specimenData.name}</h1>
          <p className="text-lg text-gray-600">{specimenData.system}</p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image section */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={specimenData.imageUrl}
                alt={specimenData.name}
                className="w-full h-auto transition-transform duration-200 ease-in-out"
                style={{ transform: `scale(${zoomLevel})` }}
              />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={handleZoomIn}
                  className="bg-gray-800 bg-opacity-75 text-white p-2 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="bg-gray-800 bg-opacity-75 text-white p-2 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 transform rotate-90" />
                </button>
              </div>
            </div>
          </div>

          {/* Information section */}
          <div className="space-y-6">
            {/* Audio player */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Audio Description</h2>
                <button
                  onClick={toggleAudio}
                  className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                >
                  {isPlaying ? (
                    <SpeakerXMarkIcon className="h-6 w-6" />
                  ) : (
                    <SpeakerWaveIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
              <audio
                ref={(audio) => setAudioElement(audio)}
                src={specimenData.audioUrl}
                className="hidden"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700">{specimenData.description}</p>
            </div>

            {/* Clinical Correlation */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Clinical Correlation</h2>
              <p className="text-gray-700">{specimenData.clinicalCorrelation}</p>
            </div>

            {/* Microscopic Findings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Microscopic Findings</h2>
              <p className="text-gray-700">{specimenData.microscopicFindings}</p>
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
  );
};

export default SpecimenDetail;
