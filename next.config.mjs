/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'ui-avatars.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'fastly.picsum.photos',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
                pathname: '**',
            }
        ],
    },
};

export default nextConfig;
