import { useState } from 'react';
import { ImagePicker } from './components/ImagePicker';
import { SubjectExtractor } from './components/SubjectExtractor';

export default function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelect = (imageUrl: string) => {
    const img = new Image();
    img.onload = () => {
      setSelectedImage(imageUrl);
    };
    img.src = imageUrl;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Subject Extractor</h1>
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
}