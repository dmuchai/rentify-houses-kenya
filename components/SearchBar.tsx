import React, { useState } from 'react';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import { MagnifyingGlassIcon, KenyanCounties } from '../constants';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
  isLoading?: boolean;
}

export interface SearchFilters {
  location?: string;
  county?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialFilters = {}, isLoading = false }) => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value ? (name.includes('Price') || name === 'bedrooms' ? Number(value) : value) : undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const countyOptions = KenyanCounties.map(county => ({ value: county, label: county }));

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <Input
          label="Location/Keyword"
          name="location"
          placeholder="e.g. Kilimani, 2 bedroom near Yaya"
          value={filters.location || ''}
          onChange={handleChange}
          containerClassName="lg:col-span-2"
        />
        <Select
          label="County"
          name="county"
          options={countyOptions}
          value={filters.county || ''}
          onChange={handleChange}
          placeholder="Any County"
        />
         <Input
          label="Bedrooms"
          name="bedrooms"
          type="number"
          min="0"
          placeholder="Any"
          value={filters.bedrooms || ''}
          onChange={handleChange}
        />
        {/* Price and other filters could be added here or in an "Advanced Filters" modal */}
        <Button 
          type="submit" 
          className="w-full h-full md:mt-0" 
          isLoading={isLoading}
          leftIcon={<MagnifyingGlassIcon className="w-5 h-5"/>}
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default SearchBar;
