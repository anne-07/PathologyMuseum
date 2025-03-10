import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const bodySystems = [
  {
    id: 'female-genital',
    name: 'Female Genital System',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1674086619163-54bd6379f538?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    count: 12,
  },
  {
    id: 'nervous',
    name: 'Nervous System',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1674086619163-54bd6379f538?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    count: 8,
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular System',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1674086619163-54bd6379f538?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    count: 15,
  },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');

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
            Learn Without Boundaries – Discover our comprehensive collection of pathological specimens and histological slides
          </p>
          
          {/* Search Bar */}
          <div className="mt-10 max-w-xl">
            <div className="relative">
              <input
                type="text"
                className="block w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                placeholder="Search specimens, diseases, systems, or slides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

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
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {bodySystems.map((system) => (
            <Link
              key={system.id}
              to={`/specimens?system=${system.id}`}
              className="relative overflow-hidden rounded-lg group"
            >
              <div className="aspect-w-3 aspect-h-2">
                <img
                  src={system.imageUrl}
                  alt={system.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
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
                      <span>High-resolution specimen images</span>
                    </li>
                    <li className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Interactive slide viewer</span>
                    </li>
                    <li className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Expert audio descriptions</span>
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

      {/* Modern Contact Form Section */}
<div className="bg-white py-24 sm:py-32">
  <div className="mx-auto max-w-7xl px-6 lg:px-8">
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-bold tracking-tight text-primary-600 sm:text-4xl">
        Contact Us
      </h2>
      <p className="mt-2 text-lg leading-8 text-gray-600">
        Have questions or suggestions? We'd love to hear from you.
      </p>
    </div>
    <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl sm:mt-20">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Name Field */}
        <div className="relative">
          <label htmlFor="name" className="absolute -top-2 left-2 bg-white px-1 text-sm font-medium text-gray-900">
            Full name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            required
          />
        </div>

        {/* Email Field */}
        <div className="relative">
          <label htmlFor="email" className="absolute -top-2 left-2 bg-white px-1 text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            required
          />
        </div>

        {/* Subject Field */}
        <div className="col-span-full relative">
          <label htmlFor="subject" className="absolute -top-2 left-2 bg-white px-1 text-sm font-medium text-gray-900">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            required
          />
        </div>

        {/* Message Field */}
        <div className="col-span-full relative">
          <label htmlFor="message" className="absolute -top-2 left-2 bg-white px-1 text-sm font-medium text-gray-900">
            Message
          </label>
          <textarea
            name="message"
            id="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            className="block w-full rounded-lg border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
            required
          />
        </div>
      </div>
      <div className="mt-10 flex items-center justify-end gap-x-6">
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-800 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-primary-500 hover:to-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          Send Message
        </button>
      </div>
    </form>
  </div>
</div>
</div>
);
}