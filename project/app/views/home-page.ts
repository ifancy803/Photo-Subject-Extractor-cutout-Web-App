import { EventData, Image, ImageSource } from '@nativescript/core';
import { ImagePicker } from '@nativescript/imagepicker';
import { ImageProcessorService } from '../services/image-processor.service';
import { Observable } from '@nativescript/core';

export class HomeViewModel extends Observable {
    private imagePicker: ImagePicker;
    private imageProcessor: ImageProcessorService;
    private selectedImage: ImageSource | null = null;
    private extractedSubject: ImageSource | null = null;

    constructor() {
        super();
        this.imagePicker = new ImagePicker();
        this.imageProcessor = new ImageProcessorService();
        this.set('hasExtractedSubject', false);
    }

    async onSelectPhoto() {
        try {
            const selection = await this.imagePicker.present();
            if (selection.length > 0) {
                const imageAsset = selection[0];
                this.selectedImage = await ImageSource.fromAsset(imageAsset);
                const image = this.get('mainImage');
                if (image) {
                    image.imageSource = this.selectedImage;
                }
                this.set('hasExtractedSubject', false);
            }
        } catch (error) {
            console.error('Error selecting photo:', error);
        }
    }

    async onImageLongPress() {
        if (!this.selectedImage) return;

        try {
            this.extractedSubject = await this.imageProcessor.extractSubject(this.selectedImage);
            if (this.extractedSubject) {
                const image = this.get('mainImage');
                if (image) {
                    image.imageSource = this.extractedSubject;
                }
                this.set('hasExtractedSubject', true);
            }
        } catch (error) {
            console.error('Error extracting subject:', error);
        }
    }

    async onSaveSubject() {
        if (!this.extractedSubject) return;

        try {
            // Save the extracted subject to gallery
            const saved = await this.extractedSubject.saveToFile(
                `${this.getOutputPath()}/extracted_subject_${Date.now()}.png`,
                "png"
            );
            if (saved) {
                // Show success message
                alert("Subject saved successfully!");
            }
        } catch (error) {
            console.error('Error saving subject:', error);
            alert("Failed to save the subject");
        }
    }

    private getOutputPath(): string {
        // Get the proper path for saving images based on the platform
        return android.os.Environment.getExternalStoragePublicDirectory(
            android.os.Environment.DIRECTORY_PICTURES
        ).getAbsolutePath();
    }
}

export function onNavigatingTo(args: EventData) {
    const page = args.object;
    page.bindingContext = new HomeViewModel();
}