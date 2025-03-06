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

      {/* Featured Specimens Section */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Featured Specimens
          </h2>
          <div className="mt-10">
            {/* Add featured specimens grid here */}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          What Our Users Say
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add testimonial cards here */}
        </div>
      </div>
    </div>
  );
}
