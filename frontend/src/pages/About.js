import React from 'react';

export default function About() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            About Digital Pathology Museum
          </h1>
          <div className="mt-6 space-y-6 text-gray-500">
            <p>
              The Digital Pathology Museum is an innovative educational platform designed to make pathology
              specimens and histological slides accessible to medical students, pathologists, and healthcare
              professionals worldwide.
            </p>
            <p>
              Our mission is to bridge the gap between traditional pathology education and modern digital
              learning by providing high-quality, interactive resources that enhance understanding of
              pathological conditions.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-12">Our Features</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>High-resolution specimen images with zoom capability</li>
              <li>Interactive histological slide viewer</li>
              <li>Expert audio descriptions and annotations</li>
              <li>Comprehensive clinical correlations</li>
              <li>Organized by body systems for easy navigation</li>
              <li>Personal bookmarking and note-taking system</li>
            </ul>
            <h2 className="text-2xl font-bold text-gray-900 mt-12">Our Team</h2>
            <p>
              Our platform is maintained by a dedicated team of pathologists, medical educators, and
              technology experts committed to advancing pathology education through digital innovation.
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-12">Contact Us</h2>
            <p>
              We welcome your feedback and suggestions. Please feel free to reach out to us through our
              contact page or email us directly at support@digitalpathologymuseum.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
