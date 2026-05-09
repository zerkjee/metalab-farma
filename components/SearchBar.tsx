'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchBarProps {
  compact?: boolean;
}

export default function SearchBar({ compact = false }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/?busca=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSearch} className="flex-1 flex items-center">
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="ml-2 p-2 text-gray-600 hover:text-purple-600 transition-colors"
        >
          <Search size={20} />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar suplementos, vitaminas, minerais..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-purple-600 transition-colors"
        >
          <Search size={20} />
        </button>
      </div>
    </form>
  );
}
