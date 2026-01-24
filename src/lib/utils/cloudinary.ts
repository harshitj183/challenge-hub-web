import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder name
 * @param resourceType - 'image' or 'video'
 * @returns Upload result with URL
 */
export async function uploadToCloudinary(
    file: string,
    folder: string = 'challenge-suite',
    resourceType: 'image' | 'video' = 'image'
) {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: resourceType,
            transformation: resourceType === 'image'
                ? [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
                : undefined,
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
        };
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        throw new Error(error.message || 'Failed to upload file');
    }
}

/**
 * Delete file from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param resourceType - 'image' or 'video'
 */
export async function deleteFromCloudinary(
    publicId: string,
    resourceType: 'image' | 'video' = 'image'
) {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error: any) {
        console.error('Cloudinary delete error:', error);
        throw new Error(error.message || 'Failed to delete file');
    }
}

export default cloudinary;
