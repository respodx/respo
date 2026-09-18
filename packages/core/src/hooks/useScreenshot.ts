import { useCallback } from 'react';
import * as htmlToImage from 'html-to-image';

export function useScreenshot() {
  const captureAndDownload = useCallback(async (element: HTMLElement, filename: string) => {
    try {
      if (!element) {
        console.error('Element not provided for screenshot.');
        return false;
      }

      // We use toPng from html-to-image
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        // Iframes can cause cross-origin issues if not same-origin, but we try anyway
      });

      // Create a temporary link to download the image
      const link = document.createElement('a');
      link.download = `${filename}-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      
      return true;
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      return false;
    }
  }, []);

  return { captureAndDownload };
}
