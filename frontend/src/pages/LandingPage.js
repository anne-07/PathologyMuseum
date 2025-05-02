import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const initialBodySystems = [
  {
    id: 'General',
    name: 'General Pathology',
    imageUrl: 'https://img.freepik.com/premium-photo/human-body-with-blue-background-that-says-human-anatomy_130714-4503.jpg',
    count: 0,
  },
  {
    id: 'Female Genital',
    name: 'Female Genital Tract',
    imageUrl: 'https://media.gettyimages.com/id/1682989686/vector/female-reproductive-organs-illustration.jpg?s=612x612&w=0&k=20&c=yRkD2P9BOGFGxIBS5g-yyJaL1TIgBR0KC28dC7wzbr4=',
    count: 0,
  },
  {
    id: 'Head and Neck',
    name: 'Head and Neck',
    imageUrl: 'https://www.healthxchange.sg/sites/hexassets/Assets/head-neck/how-to-take-care-of-nervous-system.jpg',
    count: 0,
  },
  {
    id: 'Cardiovascular',
    name: 'Cardiovascular System',
    imageUrl: 'https://www.shutterstock.com/image-illustration/3d-rendered-medical-illustration-male-600nw-2256981889.jpg',
    count: 0,
  },
  {
    id: 'Respiratory',
    name: 'Respiratory System',
    imageUrl: 'https://img.freepik.com/premium-photo/human-respiratory-system-lungs-anatomy-3d-illustration_1302875-22727.jpg',
    count: 0,
  },
  {
    id: 'Hepatobiliary',
    name: 'Hepatobiliary system',
    imageUrl: 'https://t3.ftcdn.net/jpg/05/47/99/04/360_F_547990421_TsWtvbI2WL5wHU1aArXE7vcprk8BkU5p.jpg',
    count: 0,
  },
  {
    id: 'Male Genital',
    name: 'Male Genital Tract',
    imageUrl: 'https://www.shutterstock.com/shutterstock/videos/1097590213/thumb/1.jpg?ip=x480',
    count: 0,
  },
  {
    id: 'Kidney and Lower Urinary',
    name: 'Kidney and Lower Urinary Tract',
    imageUrl: 'https://st4.depositphotos.com/6563466/38183/i/450/depositphotos_381839760-stock-photo-human-urinary-system-bladder-anatomy.jpg',
    count: 0,
  },
  {
    id: 'Breast',
    name: 'Breast',
    imageUrl: 'https://www.shutterstock.com/image-illustration/3d-rendered-medically-accurate-illustration-600nw-1186974508.jpg',
    count: 0,
  },
  {
    id: 'Gastrointestinal',
    name: 'Gastrointestinal system',
    imageUrl: 'https://exam.kku.ac.th/pluginfile.php/81176/course/overviewfiles/Gastrointestinal%20System.jpg',
    count: 0,
  },
  {
    id: 'Bone and Soft tissue',
    name: 'Bone and Soft tissue',
    imageUrl: 'https://lh3.googleusercontent.com/proxy/l8Y9OB6lieOhdKAayEM1Xc-nbKj3yfIpY9ZM8ZAhfdlqe47qaFphr8bYWoRj2Qvl2FgGxhPBQ1vxeK723TkLt_X48o9YOriFpT25',
    count: 0,
  },
  {
    id: 'Miscellaneous',
    name: 'Miscellaneous',
    imageUrl: 'https://img.freepik.com/premium-photo/human-body-with-blue-background-that-says-human-anatomy_130714-4503.jpg',
    count: 0,
  },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bodySystems, setBodySystems] = useState(initialBodySystems);

  // Fetch specimen counts for each system
  useEffect(() => {
    const fetchSpecimenCounts = async () => {
      try {
        const response = await axios.get(`${API_URL}/specimens`);
        if (!response.data || !response.data.data || !response.data.data.specimens) {
          console.error('Invalid response format:', response.data);
          return;
        }

        const specimens = response.data.data.specimens;
        if (!Array.isArray(specimens)) {
          console.error('Specimens data is not an array:', specimens);
          return;
        }

        // Count specimens for each system
        const systemCounts = {};
        specimens.forEach(specimen => {
          if (specimen && specimen.system) {
            systemCounts[specimen.system] = (systemCounts[specimen.system] || 0) + 1;
          }
        });

        console.log('System counts:', systemCounts); // Debug log

        // Update body systems with counts
        setBodySystems(prevSystems => 
          prevSystems.map(system => {
            const count = systemCounts[system.id] || 0;
            console.log(`Count for ${system.id}:`, count); // Debug log
            return {
              ...system,
              count
            };
          })
        );
      } catch (error) {
        console.error('Error fetching specimen counts:', error);
      }
    };

    fetchSpecimenCounts();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover"
            src="https://plus.unsplash.com/premium_photo-1674086619163-54bd6379f538?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Hero background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 mix-blend-multiply" />
        </div>
        <div className="relative mx-auto max-w-7xl py-24 px-6 sm:py-32 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Explore the Virtual Pathology Museum
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-gray-100">
            Learn Without Boundaries – Discover our comprehensive collection of pathological specimens
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex gap-x-6">
            <Link
              to="/home"
              className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Start Learning
            </Link>
            <Link
              to="/specimens"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Browse Specimens
            </Link>
          </div>
        </div>
      </div>

      {/* Body Systems Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Explore by Body System
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {bodySystems.map((system) => (
            <Link
              key={system.id}
              to={`/specimens?system=${system.id}`}
              className="relative overflow-hidden rounded-lg group"
            >
              <div className="w-full h-full overflow-hidden">
                <div className="relative w-full pb-[100%]">
                  <img
                    src={system.imageUrl}
                    alt={system.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', minWidth: '100%', minHeight: '100%', width: 'auto', height: 'auto' }}
                    onLoad={(e) => {
                      console.log(`Image loaded successfully: ${system.name}`);
                    }}
                    onError={(e) => {
                      console.error(`Failed to load primary image for ${system.name}:`, {
                        url: system.imageUrl,
                        alt: system.name
                      });
                      
                      // Try backup URLs
                      if (system.backupUrls && system.backupUrls.length > 0) {
                        const backupUrl = system.backupUrls.shift();
                        console.log(`Attempting backup URL: ${backupUrl}`);
                        e.target.src = backupUrl;
                      } else {
                        // Final fallback
                        e.target.src = `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(system.name)}`;
                        e.target.style.objectFit = 'cover';
                        e.target.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
              </div>
              <div className="absolute bottom-0 p-6">
                <h3 className="text-xl font-semibold text-white">{system.name}</h3>
                <p className="mt-2 text-sm text-gray-300">{system.count} specimens</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              About Digital Pathology Museum
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our mission is to bridge the gap between traditional pathology education and modern digital learning.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">Our Mission</dt>
                <dd className="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">To provide high-quality, interactive resources that enhance understanding of pathological conditions.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">Our Features</dt>
                <dd className="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <ul role="list" className="flex-auto space-y-4">
                    <li className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Interactive 3D specimen exploration for immersive learning</span>
                    </li>
                    <li className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Audio descriptions to enhance understanding</span>
                    </li>
                    <li className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Learn pathology anytime, anywhere — no need to visit the museum</span>
                    </li>
                  </ul>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-base font-semibold leading-7 text-gray-900">Our Team</dt>
                <dd className="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Dedicated pathologists, medical educators, and technology experts committed to advancing pathology education.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-600 sm:text-4xl">
            Contact Us
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Reach out to us through the following details.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-xl sm:mt-20 text-center">
          <p className="text-lg text-gray-700 font-medium">Phone: +91 8888888888</p>
          <p className="text-lg text-gray-700 font-medium">Email: abc@gmail.com</p>
          <p className="text-lg text-gray-700 font-medium">Address: Pune, India</p>
        </div>
      </div>
    </div>
</div>
);
}