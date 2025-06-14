// src/hooks/useImagePreloader.ts
import { useState, useEffect } from 'react';

function preloadImage(src: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      resolve(img);
    };
    img.onerror = img.onabort = function() {
      reject(src);
    };
    img.src = src;
  });
}

export function useImagePreloader(imageList: string[]) {
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function effect() {
      if (isCancelled || !imageList || imageList.length === 0) {
        return;
      }

      await Promise.all(imageList.map(preloadImage));

      if (!isCancelled) {
        setImagesPreloaded(true);
      }
    }

    effect();

    return () => {
      isCancelled = true;
    };
  }, [imageList]);

  return { imagesPreloaded };
}