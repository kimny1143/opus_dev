import React from 'react';
import { Tag } from '@prisma/client';

interface TagChipProps {
  tag: Tag;
  isSelected: boolean;
  onToggle: (tagId: number) => void;
}

const TagChip: React.FC<TagChipProps> = ({ tag, isSelected, onToggle }) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(tag.id)}
      className={`px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2 transition-colors ${
        isSelected
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {tag.name}
    </button>
  );
};

export default TagChip;