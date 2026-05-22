/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const LoadingScreen = ({ onComplete }: { onComplete?: () => void }) => {
	const overlayRef = useRef<HTMLDivElement | null>(null);
	const textRef = useRef<HTMLHeadingElement | null>(null);
	const percentRef = useRef<HTMLDivElement | null>(null);

	// Refs for the 5 characters
	const jesterRef = useRef<HTMLDivElement | null>(null);
	const explorerRef = useRef<HTMLDivElement | null>(null);
	const sageRef = useRef<HTMLDivElement | null>(null);
	const outlawRef = useRef<HTMLDivElement | null>(null);
	const creatorRef = useRef<HTMLDivElement | null>(null);

	const [progress, setProgress] = useState(0);
	const [isVisible, setIsVisible] = useState(true);

	const isLoadedRef = useRef(false);
	const minTimeElapsedRef = useRef(false);

	// Lock body scroll while loading is active
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	}, []);

	// Guarantee minimum display time of 3.5 seconds so all character entrance animations complete beautifully
	useEffect(() => {
		const timer = setTimeout(() => {
			minTimeElapsedRef.current = true;
		}, 3500);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		// 1. Initial GSAP setup for character entries (mimicking the offscreen starting positions from ribbit.dk)
		const chars = [
			{ ref: jesterRef, start: { rotation: 40, x: '-73%', y: '80%' } },
			{ ref: explorerRef, start: { rotation: -30, x: '20%', y: '115%' } },
			{ ref: sageRef, start: { rotation: -110, x: '150%', y: '-30%' } },
			{ ref: outlawRef, start: { rotation: 183, x: '10%', y: '-100%' } },
			{ ref: creatorRef, start: { rotation: 130, x: '-95%', y: '-70%' } },
		];

		chars.forEach((c) => {
			if (c.ref.current) {
				gsap.set(c.ref.current, c.start);
			}
		});

		// 2. Animate characters into their corner positions
		const tl = gsap.timeline();

		// Jester animation (bottom-left)
		if (jesterRef.current) {
			tl.to(jesterRef.current, { x: '-13%', ease: 'power4.out', duration: 1.7 }, 0.2);
			tl.to(jesterRef.current, { y: '32%', ease: 'power4.out', duration: 0.8 }, 0.2);
			tl.to(jesterRef.current, { rotation: 15, ease: 'power4.out', duration: 1.7 }, 0.2);
		}

		// Explorer animation (bottom-right)
		if (explorerRef.current) {
			tl.to(explorerRef.current, { x: '0%', ease: 'power3.out', duration: 0.9 }, 0.4);
			tl.to(explorerRef.current, { y: '20%', ease: 'expo.out', duration: 1.7 }, 0.4);
			tl.to(explorerRef.current, { rotation: -45, ease: 'power3.out', duration: 1.7 }, 0.4);
		}

		// Sage animation (top-right)
		if (sageRef.current) {
			tl.to(sageRef.current, { x: '-25%', ease: 'power4.out', duration: 1.5 }, 0.55);
			tl.to(sageRef.current, { y: '-30%', ease: 'power4.out', duration: 1.5 }, 0.55);
			tl.to(sageRef.current, { rotation: -135, ease: 'power3.out', duration: 1.2 }, 0.55);
		}

		// Outlaw animation (top-middle)
		if (outlawRef.current) {
			tl.to(outlawRef.current, { x: '-10%', ease: 'power3.out', duration: 1.4 }, 0.9);
			tl.to(outlawRef.current, { y: '-5%', ease: 'expo.out', duration: 1.4 }, 0.9);
			tl.to(outlawRef.current, { rotation: 177, ease: 'power3.out', duration: 1.4 }, 0.9);
		}

		// Creator animation (top-left)
		if (creatorRef.current) {
			tl.to(creatorRef.current, { x: '-30%', ease: 'expo.out', duration: 1.4 }, 0.65);
			tl.to(creatorRef.current, { y: '10%', ease: 'power3.out', duration: 1.4 }, 0.65);
			tl.to(creatorRef.current, { rotation: 120, ease: 'power3.out', duration: 1.4 }, 0.65);
		}

		// 3. Setup SplitText-like animation for subtitle words "Howdy we are"
		if (textRef.current) {
			const words = textRef.current.children;
			gsap.set(words, { opacity: 0, x: 72 });
			gsap.to(words[0], { opacity: 1, x: 0, ease: 'expo.out', duration: 1.2, delay: 0.2 });
			gsap.to(words[1], { opacity: 1, x: 0, ease: 'expo.out', duration: 1.0, delay: 0.8 });
			gsap.to(words[2], { opacity: 1, x: 0, ease: 'expo.out', duration: 1.0, delay: 0.82 });
		}
	}, []);

	// 4. Loading logic & real image preloading
	useEffect(() => {
		const ALL_IMAGE_FOLDERS = [
			{ name: 'sage_push', count: 174 },
			{ name: 'sage_pull', count: 25 },
			{ name: 'creator_idle', count: 51 },
			{ name: 'creator_push', count: 40 },
			{ name: 'creator_pull', count: 40 },
			{ name: 'explorer_idle', count: 40 },
			{ name: 'explorer_push', count: 40 },
			{ name: 'explorer_pull', count: 40 },
			{ name: 'jester_idle_2', count: 51 },
			{ name: 'jester_push_2', count: 58 },
			{ name: 'outlaw_idle', count: 25 },
			{ name: 'outlaw_push', count: 24 },
			{ name: 'outlaw_pull', count: 26 },
		];

		const PRELOAD_PATHS = ALL_IMAGE_FOLDERS.flatMap((folder) =>
			Array.from({ length: folder.count }, (_, i) => `/assets/${folder.name}/${String(i).padStart(3, '0')}.png`)
		);

		let loadedCount = 0;
		const total = PRELOAD_PATHS.length;
		let displayProgress = 0;
		let rafId: number;
		let targetProgress = 0;

		// Create global memory cache to completely bypass browser network cache on scroll
		if (!(window as any).PRELOADED_IMAGES) {
			(window as any).PRELOADED_IMAGES = {};
		}
		if (!(window as any).PRELOADED_IMAGE_ELEMENTS) {
			(window as any).PRELOADED_IMAGE_ELEMENTS = {};
		}
		if (!(window as any).PRELOADED_IMAGE_PROMISES) {
			(window as any).PRELOADED_IMAGE_PROMISES = {};
		}

		// Concurrency limiter to prevent browser network exhaustion (ERR_INSUFFICIENT_RESOURCES)
		const CONCURRENCY = 15;
		let currentIndex = 0;

		const loadNext = (): Promise<void> => {
			if (currentIndex >= PRELOAD_PATHS.length) return Promise.resolve();
			const src = PRELOAD_PATHS[currentIndex++];

			// Skip if already loaded
			if ((window as any).PRELOADED_IMAGES[src]) {
				loadedCount++;
				targetProgress = Math.floor((loadedCount / total) * 99);
				return loadNext();
			}

			if (!(window as any).PRELOADED_IMAGE_PROMISES[src]) {
				(window as any).PRELOADED_IMAGE_PROMISES[src] = fetch(src)
					.then((res) => {
						if (!res.ok) throw new Error('Failed');
						return res.blob();
					})
					.then((blob) => {
						const objectUrl = URL.createObjectURL(blob);
						(window as any).PRELOADED_IMAGES[src] = objectUrl;
						const image = new Image();
						image.src = objectUrl;
						(window as any).PRELOADED_IMAGE_ELEMENTS[src] = image;
					})
					.catch(() => {
						// Fallback to original src later if this fails
					});
			}

			return (window as any).PRELOADED_IMAGE_PROMISES[src].finally(() => {
				loadedCount++;
				targetProgress = Math.floor((loadedCount / total) * 99);
				return loadNext();
			});
		};

		const workers = Array.from({ length: Math.min(CONCURRENCY, PRELOAD_PATHS.length) }, () => loadNext());

		// Smoothly animate the progress number
		const animateProgress = () => {
			if (isLoadedRef.current && minTimeElapsedRef.current) {
				if (displayProgress < 100) {
					displayProgress += Math.max(1, Math.floor((100 - displayProgress) * 0.15));
					setProgress(Math.min(100, displayProgress));
				}
				if (displayProgress >= 100) {
					return; // Stop animation loop
				}
			} else if (displayProgress < targetProgress) {
				// Accelerate slightly if we are far behind, but keep it smooth
				const diff = targetProgress - displayProgress;
				displayProgress += Math.max(1, Math.floor(diff * 0.1));
				setProgress(displayProgress);
			}
			rafId = requestAnimationFrame(animateProgress);
		};
		rafId = requestAnimationFrame(animateProgress);

		Promise.all(workers).then(() => {
			isLoadedRef.current = true;
		});

		// Fallback in case some network weirdness stalls the promises forever (5 minutes for extremely slow connections)
		const fallbackTimer = window.setTimeout(() => {
			isLoadedRef.current = true;
		}, 300000);

		return () => {
			cancelAnimationFrame(rafId);
			clearTimeout(fallbackTimer);
		};
	}, []);

	// 6. Trigger exit transition when progress hits 100%
	useEffect(() => {
		if (progress === 100) {
			const exitTl = gsap.timeline({
				onComplete: () => {
					setIsVisible(false);
					if (onComplete) onComplete();
				},
			});

			// Fade out copy and percentage first
			exitTl.to([textRef.current, percentRef.current], {
				opacity: 0,
				y: -20,
				duration: 0.5,
				ease: 'power3.in',
			});

			// Animate characters exiting the screen
			if (jesterRef.current)
				exitTl.to(
					jesterRef.current,
					{ x: '-73%', y: '80%', rotation: 40, duration: 1.0, ease: 'power3.in' },
					0.1
				);
			if (explorerRef.current)
				exitTl.to(
					explorerRef.current,
					{ x: '20%', y: '115%', rotation: -30, duration: 1.0, ease: 'power3.in' },
					0.1
				);
			if (sageRef.current)
				exitTl.to(
					sageRef.current,
					{ x: '150%', y: '-30%', rotation: -110, duration: 1.0, ease: 'power3.in' },
					0.15
				);
			if (outlawRef.current)
				exitTl.to(
					outlawRef.current,
					{ x: '10%', y: '-100%', rotation: 183, duration: 1.0, ease: 'power3.in' },
					0.2
				);
			if (creatorRef.current)
				exitTl.to(
					creatorRef.current,
					{ x: '-95%', y: '-70%', rotation: 130, duration: 1.0, ease: 'power3.in' },
					0.15
				);

			// Premium hardware-accelerated CSS Mask exit transition (opens from inside-out!)
			if (overlayRef.current) {
				const maskObj = { radius: 0 };
				exitTl.to(
					maskObj,
					{
						radius: 150,
						duration: 1.4,
						ease: 'power4.inOut',
						onUpdate: () => {
							if (overlayRef.current) {
								overlayRef.current.style.maskImage = `radial-gradient(circle at 50% 50%, transparent ${maskObj.radius}%, black ${maskObj.radius}%)`;
								overlayRef.current.style.webkitMaskImage = `radial-gradient(circle at 50% 50%, transparent ${maskObj.radius}%, black ${maskObj.radius}%)`;
							}
						},
					},
					0.3
				);
			}
		}
	}, [progress, onComplete]);

	if (!isVisible) return null;

	return (
		<div
			ref={overlayRef}
			className='bg-lightpurple z-loading pointer-events-auto fixed inset-0 flex h-dvh w-full flex-col items-center justify-center overflow-hidden select-none'
			style={{
				maskImage: 'radial-gradient(circle at 50% 50%, transparent 0%, black 0%)',
				WebkitMaskImage: 'radial-gradient(circle at 50% 50%, transparent 0%, black 0%)',
			}}
		>
			{/* Center text & progress content */}
			<div className='relative z-10 flex flex-col items-center justify-center px-4 text-center'>
				<h5
					ref={textRef}
					className='font-display mb-6 flex items-center gap-1.5 text-lg font-normal font-serif tracking-tight text-white/95 uppercase'
				>
					<span className='inline-block'>Howdy</span>
					<span className='inline-block'>we</span>
					<span className='inline-block'>are</span>
				</h5>

				<div className='mb-6 flex h-12 items-center justify-center overflow-hidden'>
					<img
						src='/assets/logo_light.svg'
						alt='ribbit-logo'
						className='h-10 w-auto animate-pulse md:h-12'
					/>
				</div>

				<div
					ref={percentRef}
					className='min-w-24 rounded-full bg-white/10 px-4 py-1.5 text-center font-mono text-xl font-bold tracking-widest text-white shadow-inner backdrop-blur-sm md:text-2xl'
				>
					{progress}%
				</div>
			</div>

			{/* Corner character figures */}
			<div className='pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden select-none'>
				{/* Jester (bottom-left) */}
				<div
					ref={jesterRef}
					className='absolute bottom-0 left-0 aspect-1350/735 w-[50%] max-w-142.5 md:w-[35%]'
				>
					<img
						src='/assets/intro/jester.png'
						alt='jester'
						className='h-auto w-full object-contain'
						draggable={false}
					/>
				</div>

				{/* Explorer (bottom-right) */}
				<div
					ref={explorerRef}
					className='absolute right-0 bottom-0 aspect-638/715 w-[24%] max-w-[320px] md:w-[18%]'
				>
					<img
						src='/assets/intro/explorer.png'
						alt='explorer'
						className='h-auto w-full object-contain'
						draggable={false}
					/>
				</div>

				{/* Sage (top-right) */}
				<div
					ref={sageRef}
					className='absolute top-0 right-0 aspect-390/766 w-[15%] max-w-55 md:w-[11%]'
				>
					<img
						src='/assets/intro/sage.png'
						alt='sage'
						className='h-auto w-full object-contain'
						draggable={false}
					/>
				</div>

				{/* Outlaw (top-middle) */}
				<div
					ref={outlawRef}
					className='absolute top-0 left-[36%] aspect-575/447 w-[22%] max-w-70 md:w-[16%]'
				>
					<img
						src='/assets/intro/outlaw.png'
						alt='outlaw'
						className='h-auto w-full object-contain'
						draggable={false}
					/>
				</div>

				{/* Creator (top-left) */}
				<div
					ref={creatorRef}
					className='absolute top-0 left-0 aspect-785/709 w-[28%] max-w-90 md:w-[22%]'
				>
					<img
						src='/assets/intro/creator.png'
						alt='creator'
						className='h-auto w-full object-contain'
						draggable={false}
					/>
				</div>
			</div>
		</div>
	);
};
