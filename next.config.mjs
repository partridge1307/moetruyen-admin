import withPlaiceholder from '@plaiceholder/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['i.moetruyen.net'],
  },
};

export default withPlaiceholder(nextConfig);
