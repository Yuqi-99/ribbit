const getPreloadedImages = (): Record<string, string> | undefined => {
	if (typeof window === 'undefined') return undefined;
	return (window as unknown as { PRELOADED_IMAGES?: Record<string, string> }).PRELOADED_IMAGES;
};

const getPreloadedImageElements = (): Record<string, HTMLImageElement> | undefined => {
	if (typeof window === 'undefined') return undefined;
	return (window as unknown as { PRELOADED_IMAGE_ELEMENTS?: Record<string, HTMLImageElement> })
		.PRELOADED_IMAGE_ELEMENTS;
};

export const getPreloadedImageSrc = (src: string) => getPreloadedImages()?.[src];

export const getPreloadedOrFallbackImageSrc = (src: string, fallbackSrc = src) =>
	getPreloadedImageSrc(src) ?? getPreloadedImageSrc(fallbackSrc) ?? fallbackSrc;

export const getPreloadedImageElement = (src: string, fallbackSrc = src) =>
	getPreloadedImageElements()?.[src] ?? getPreloadedImageElements()?.[fallbackSrc];
