import React, { useState } from 'react';

export default function Contact() {
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
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Have questions or suggestions? We'd love to hear from you. Send us a message and we'll respond
            as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="mt-12 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <div className="mt-1">
                <textarea
                  name="message"
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Send Message
              </button>
            </div>
          </form>

          <div className="mt-16 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900">Other Ways to Reach Us</h2>
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Email</h3>
                <p className="mt-2 text-gray-600">support@digitalpathologymuseum.com</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Address</h3>
                <p className="mt-2 text-gray-600">
                  Digital Pathology Museum
                  <br />
                  Medical Education Center
                  <br />
                  Mumbai, India
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
