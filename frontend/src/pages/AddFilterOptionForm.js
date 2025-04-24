import React, { useState } from 'react';

export default function AddFilterOptionForm({ type, onAdd }) {
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!value.trim()) return;
        onAdd(type, value.trim());
        setValue('');
      }}
      className="flex gap-2"
    >
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={`Add new ${type}`}
        className="border rounded px-2 py-1 text-sm"
      />
      <button type="submit" className="text-xs bg-primary-600 text-white rounded px-2 py-1">Add</button>
    </form>
  );
}
