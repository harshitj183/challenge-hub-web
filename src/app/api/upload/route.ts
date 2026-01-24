import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';

// POST /api/upload - Upload file to Cloudinary
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'image' or 'video'

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const resourceType = type === 'video' ? 'video' : 'image';
        const allowedTypes = resourceType === 'image'
            ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
            : ['video/mp4', 'video/webm', 'video/quicktime'];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate file size (10MB for images, 50MB for videos)
        const maxSize = resourceType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `File too large. Max size: ${maxSize / (1024 * 1024)}MB` },
                { status: 400 }
            );
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary
        const result = await uploadToCloudinary(
            base64,
            'challenge-suite',
            resourceType
        );

        return NextResponse.json({
            message: 'File uploaded successfully',
            url: result.url,
            publicId: result.publicId,
            width: result.width,
            height: result.height,
            format: result.format,
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload file' },
            { status: 500 }
        );
    }
}
