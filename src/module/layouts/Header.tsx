/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import { EyeIcon } from 'src/module/components/EyeIcon';
import { NavLinks } from 'src/module/layouts/NavLinks';
import { clamp } from 'src/utils/clamp';
import { cn } from 'src/utils/cn';
import { useHeaderMode } from 'src/utils/useHeaderMode';

export type HeaderMode = 'top' | 'compact' | 'expanded' | 'footer';
export type EyeTone = 'dark' | 'white';

const HOVER_CLOSE_DELAY = 140;

const FloatingHeaderControl = ({
	mode,
	isDesktop,
	isOpen,
	setIsOpen,
}: {
	mode: HeaderMode;
	isDesktop: boolean;
	isOpen: boolean;
	setIsOpen: (value: boolean) => void;
}) => {
	const ref = useRef<HTMLDivElement | null>(null);
	const hoverCloseTimer = useRef<number | null>(null);
	const [pointer, setPointer] = useState({ x: 0, y: 0 });

	const isFooterMode = mode === 'footer';
	const isExpandedMode = mode === 'expanded';
	const showLinks = isExpandedMode || isFooterMode;
	const tone: EyeTone = isFooterMode ? 'dark' : 'white';

	let width;

	if (isFooterMode || showLinks) {
		width = 400;
	} else {
		width = 80;
	}

	const eyeOffsetX = clamp(pointer.x * 5.5, -5.5, 5.5);
	const eyeOffsetY = clamp(pointer.y * 3.8, -3.8, 3.8);

	const clearCloseTimer = () => {
		if (hoverCloseTimer.current !== null) {
			window.clearTimeout(hoverCloseTimer.current);
			hoverCloseTimer.current = null;
		}
	};

	const openPanel = () => {
		clearCloseTimer();
		setIsOpen(true);
	};

	const closePanel = () => {
		clearCloseTimer();
		hoverCloseTimer.current = window.setTimeout(() => {
			setIsOpen(false);
		}, HOVER_CLOSE_DELAY);
	};

	const [isBlinking, setIsBlinking] = useState(false);
	const prevShowLinks = useRef(false);

	useEffect(() => {
		if (showLinks && !prevShowLinks.current) {
			// 展开瞬间触发眨眼
			setIsBlinking(true);
			const t = window.setTimeout(() => setIsBlinking(false), 300);
			return () => clearTimeout(t);
		}
		prevShowLinks.current = showLinks;
	}, [showLinks]);

	useEffect(() => {
		return () => clearCloseTimer();
	}, []);

	return (
		<div
			ref={ref}
			className={cn(
				'group relative flex h-12 items-center justify-center overflow-hidden rounded-full border shadow-[0_14px_40px_rgba(0,0,0,0.10)] backdrop-blur-md transition-[width,background-color,border-color,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
				tone === 'white'
					? 'border-darkink/15 bg-darkink/92 text-white shadow-[0_16px_40px_rgba(34,34,34,0.24)]'
					: 'border-darkink/8 text-darkink bg-white/88'
			)}
			style={{ width }}
			onMouseEnter={() => {
				if (!isOpen) {
					openPanel();
				}
			}}
			onMouseLeave={() => {
				setPointer({ x: 0, y: 0 });
				if (!isFooterMode) {
					closePanel();
				}
			}}
		>
			<button
				type='button'
				className='absolute left-2 z-50 flex items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
			>
				<EyeIcon tone={tone} blinking={isBlinking} offsetX={eyeOffsetX} offsetY={eyeOffsetY} />
			</button>

			<div
				className={cn(
					'flex items-center justify-center overflow-hidden transition-[left,right,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
					showLinks ? 'opacity-100' : 'opacity-0'
				)}
			>
				<NavLinks
					className={cn(
						isDesktop ? 'gap-5' : 'gap-3',
						!isDesktop && 'px-1',
						isFooterMode && 'gap-4'
					)}
					isFooterMode={isFooterMode}
				/>
			</div>

			<div className='absolute right-2 z-50 flex items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'>
				<EyeIcon tone={tone} blinking={isBlinking} offsetX={eyeOffsetX} offsetY={eyeOffsetY} />
			</div>
		</div>
	);
};

export const Header = () => {
	const { isDesktop, mode, isOpen, setIsOpen } = useHeaderMode();

	return (
		<>
			{isDesktop ? (
				<>
					<div className='pointer-events-none fixed top-8 left-8 z-50'>
						<div
							className={cn(
								'pointer-events-auto flex items-center gap-5 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
								mode === 'top' ? 'opacity-100' : 'opacity-0'
							)}
						>
							<a href='/' aria-label='Go to top'>
								<img src='/assets/logo_dark.svg' alt='ribbit-logo' className='h-8 w-auto' />
							</a>
							<NavLinks />
						</div>
					</div>

					<div
						className={cn(
							'pointer-events-none fixed top-8 left-8 z-50 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
							mode === 'top' ? 'opacity-0' : 'opacity-100'
						)}
					>
						<div className='pointer-events-auto'>
							<FloatingHeaderControl mode={mode} isDesktop isOpen={isOpen} setIsOpen={setIsOpen} />
						</div>
					</div>
				</>
			) : (
				<>
					<div className='fixed top-5 left-5 z-50'>
						<a href='/' aria-label='Go to top'>
							<img src='/assets/logo_dark.svg' alt='ribbit-logo' className='h-7 w-auto' />
						</a>
					</div>

					<div className='fixed right-0 bottom-5 left-0 z-50 flex justify-center px-4'>
						<div className='pointer-events-auto'>
							<FloatingHeaderControl
								mode={mode === 'top' ? 'compact' : mode}
								isDesktop={false}
								isOpen={isOpen}
								setIsOpen={setIsOpen}
							/>
						</div>
					</div>
				</>
			)}
		</>
	);
};
