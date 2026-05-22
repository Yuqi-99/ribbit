import { forwardRef, useCallback, useLayoutEffect, useRef, type CanvasHTMLAttributes } from 'react';
import { getPreloadedImageElement } from 'src/utils/preloadedImages';

type FrameCanvasProps = Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'src'> & {
	src: string;
	fallbackSrc?: string;
	alt: string;
};

export const FrameCanvas = forwardRef<HTMLCanvasElement, FrameCanvasProps>(
	({ src, fallbackSrc = src, alt, className, ...props }, forwardedRef) => {
		const canvasRef = useRef<HTMLCanvasElement | null>(null);

		const setCanvasRef = useCallback(
			(node: HTMLCanvasElement | null) => {
				canvasRef.current = node;

				if (typeof forwardedRef === 'function') {
					forwardedRef(node);
				} else if (forwardedRef) {
					forwardedRef.current = node;
				}
			},
			[forwardedRef]
		);

		useLayoutEffect(() => {
			const canvas = canvasRef.current;
			const image = getPreloadedImageElement(src, fallbackSrc);

			if (!canvas || !image) return;

			const draw = () => {
				const width = image.naturalWidth || image.width;
				const height = image.naturalHeight || image.height;

				if (!width || !height) return;

				if (canvas.width !== width) canvas.width = width;
				if (canvas.height !== height) canvas.height = height;

				const context = canvas.getContext('2d');
				if (!context) return;

				context.clearRect(0, 0, width, height);
				context.drawImage(image, 0, 0, width, height);
			};

			if (image.complete) {
				draw();
			} else {
				image.addEventListener('load', draw, { once: true });
				return () => image.removeEventListener('load', draw);
			}
		}, [fallbackSrc, src]);

		return (
			<canvas
				ref={setCanvasRef}
				role='img'
				aria-label={alt}
				className={className}
				{...props}
			/>
		);
	}
);

FrameCanvas.displayName = 'FrameCanvas';
