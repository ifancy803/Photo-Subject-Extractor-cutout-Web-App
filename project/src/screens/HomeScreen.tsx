import React, { useState } from 'react';
import { ImagePicker } from '../components/ImagePicker';
import { SubjectExtractor } from '../components/SubjectExtractor';

export const HomeScreen: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelect = (uri: string) => {
    setSelectedImage(uri);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Photo Subject Extractor</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <ImagePicker onImageSelect={handleImageSelect} />
          {selectedImage && (
            <div className="mt-8">
              <SubjectExtractor imageUrl={selectedImage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};