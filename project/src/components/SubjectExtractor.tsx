import { useEffect, useRef, useState } from 'react';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import * as tf from '@tensorflow/tfjs';

interface SubjectExtractorProps {
  imageUrl: string;
}

export const SubjectExtractor: React.FC<SubjectExtractorProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const extractSubject = async () => {
      try {
        const image = new Image();
        image.src = imageUrl;
        await new Promise((resolve) => {
          image.onload = resolve;
        });

        await tf.ready();
        const segmenter = await bodySegmentation.createSegmenter(
          bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation,
          { runtime: 'tfjs' }
        );

        const segmentation = await segmenter.segmentPeople(image);
        if (segmentation.length > 0 && canvasRef.current) {
          const canvas = canvasRef.current;
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const mask = await segmentation[0].mask.toImageData();
            
            for (let i = 0; i < imageData.data.length; i += 4) {
              const maskAlpha = mask.data[i + 3];
              imageData.data[i + 3] = maskAlpha;
            }
            
            ctx.putImageData(imageData, 0, 0);
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to extract subject');
        setLoading(false);
      }
    };

    extractSubject();
  }, [imageUrl]);

  const handleSave = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'extracted-subject.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {loading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Processing image...</p>
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      <canvas ref={canvasRef} className="max-w-full shadow-lg rounded-lg" />
      {!loading && !error && (
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Save Extracted Subject
        </button>
      )}
    </div>
  );
};