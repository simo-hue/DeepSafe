const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    importScripts: ['/custom-sw.js'],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    // Silence Turbopack error when using webpack plugins (like next-pwa)
    turbopack: {},
};

module.exports = withPWA(nextConfig);
