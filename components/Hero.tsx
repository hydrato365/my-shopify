// components/Hero.tsx

import Link from 'next/link';
import Image from 'next/image'; // Import the Next.js Image component

export default function Hero() {
  return (
    <div className="relative bg-gray-900 overflow-hidden h-96 md:h-[500px] flex items-center justify-center">
      <div className="absolute inset-0">
        {/* Use the Next.js Image component with the local image */}
        <Image
          src="/hero-background.jpg" // The path to your image in the public folder
          alt="Snowboarder on a mountain"
          layout="fill" // Makes the image fill the parent div
          objectFit="cover" // Ensures the image covers the area, might be cropped
          quality={80} // Adjust image quality for performance
          priority // Tells Next.js to load this image first
        />
        <div className="absolute inset-0 bg-gray-900 opacity-60"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Conquer The Slopes
        </h1>
        <p className="mt-6 max-w-lg mx-auto text-xl text-gray-300">
          Discover our latest collection of high-performance snowboards and gear. Built for riders, by riders.
        </p>
        <div className="mt-10">
          <Link
            href="/products"
            className="text-base font-medium rounded-md text-gray-900 bg-white px-8 py-3 hover:bg-gray-200 transition-colors duration-300"
          >
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
}