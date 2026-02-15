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
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'cloudflare-ipfs.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'avatars.dicebear.com',
                pathname: '**',
            }
        ],
    },
};

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: true,
        importScripts: ["/custom-sw.js"],
    },
    // crucial for custom logic
    extendDefaultHandler: true,
});


export default withPWA(nextConfig);
