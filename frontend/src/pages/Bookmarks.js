import React from 'react';
import { Link } from 'react-router-dom';

const mockBookmarks = [
  {
    id: 'spec1',
    type: 'specimen',
    name: 'Uterine Fibroids',
    description: 'Multiple well-circumscribed nodules within the myometrium',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1674086619163-54bd6379f538?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    folder: 'Exam Prep',
    notes: 'Review gross appearance and microscopic features',
  },
  {
    id: 'slide1',
    type: 'slide',
    name: 'Histological Section of Myoma',
    description: 'H&E stained section showing whorled pattern of smooth muscle bundles',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1674086619163-54bd6379f538?q=80&w=1975&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    folder: 'Revisions',
    notes: 'Compare with normal myometrium',
  },
];

export default function Bookmarks() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Your Bookmarks
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              New Folder
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockBookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="relative flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white"
            >
              <div className="aspect-w-3 aspect-h-2 bg-gray-200">
                <img
                  src={bookmark.imageUrl}
                  alt={bookmark.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                    {bookmark.folder}
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <Link to={`/${bookmark.type}s/${bookmark.id}`} className="hover:underline">
                    {bookmark.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{bookmark.description}</p>
                {bookmark.notes && (
                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                    <p className="mt-1 text-sm text-gray-500">{bookmark.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
