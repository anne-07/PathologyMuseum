import React from 'react';
import SearchableSelect from '../SearchableSelect';

const FilterSection = ({
  category,
  value,
  options,
  loading,
  onChange,
  disabled
}) => {
  const getDisplayName = (cat) => {
    switch (cat) {
      case 'diseaseCategory': return 'Disease Category';
      case 'organ': return 'Organ';
      case 'system': return 'System';
      default: return cat;
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-900">
        {getDisplayName(category)}
      </h3>
      <div className="mt-2 space-y-2 min-h-[36px]">
        {loading && <div className="text-xs text-gray-400">Loading...</div>}
        {!loading && options?.length === 0 && (
          <div className="text-xs text-gray-400">No options yet.</div>
        )}
        <SearchableSelect
          options={options}
          value={value}
          onChange={onChange}
          placeholder={`Select ${getDisplayName(category)}`}
          disabled={disabled || options?.length === 0}
        />
      </div>
    </div>
  );
};

export default FilterSection;
