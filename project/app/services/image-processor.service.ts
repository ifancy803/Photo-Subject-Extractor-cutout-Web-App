import { ImageSource } from '@nativescript/core';
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';

export class ImageProcessorService {
    private model: any;

    async initialize() {
        await tf.ready();
        // Load the TFLite model for image segmentation
        this.model = await tflite.loadTFLiteModel('assets/segmentation_model.tflite');
    }

    async extractSubject(image: ImageSource): Promise<ImageSource | null> {
        if (!this.model) {
            await this.initialize();
        }

        try {
            // Convert image to tensor
            const tensor = tf.browser.fromPixels(image);
            const resized = tf.image.resizeBilinear(tensor, [256, 256]);
            const expanded = resized.expandDims(0);
            
            // Run inference
            const predictions = await this.model.predict(expanded);
            
            // Process the segmentation mask
            const mask = predictions.squeeze();
            const maskThreshold = mask.greater(0.5);
            
            // Apply mask to original image
            const maskedImage = tensor.mul(maskThreshold.expandDims(2));
            
            // Convert back to ImageSource
            const processedCanvas = await tf.browser.toPixels(maskedImage);
            const resultImage = ImageSource.fromNativeSource(processedCanvas);
            
            // Cleanup
            tensor.dispose();
            resized.dispose();
            expanded.dispose();
            predictions.dispose();
            mask.dispose();
            maskThreshold.dispose();
            maskedImage.dispose();
            
            return resultImage;
        } catch (error) {
            console.error('Error processing image:', error);
            return null;
        }
    }
}