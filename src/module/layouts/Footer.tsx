import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { FiClock, FiMapPin, FiPhone } from 'react-icons/fi';
import { PiMailboxFill } from 'react-icons/pi';

interface FooterCharacterProps {
	id: string;
	svgPath: string;
	svgWidth: number;
	svgHeight: number;
	pngFolder: string;
	length: number;
	xAdjust: number;
	yAdjust: number;
	scale: [number, number];
	origin: [number, number];
	forcePopOut?: boolean;
}

const FooterCharacter = ({
	id,
	svgPath,
	svgWidth,
	svgHeight,
	pngFolder,
	length,
	xAdjust,
	yAdjust,
	scale,
	origin,
	forcePopOut = false,
}: FooterCharacterProps) => {
	// Component ref declarations
	const containerRef = useRef<HTMLDivElement>(null);
	const sequenceRef = useRef<HTMLDivElement>(null);

	const handleMouseEnterRef = useRef<() => void>(() => {});
	const handleMouseLeaveRef = useRef<() => void>(() => {});
	const isHoveredRef = useRef(false);
	const forcePopOutRef = useRef(forcePopOut);

	// Pre-build the frame asset paths
	const frames = Array.from({ length }, (_, i) => {
		const frameStr = String(i).padStart(3, '0');
		return `${pngFolder}${frameStr}.png`;
	});

	useEffect(() => {
		forcePopOutRef.current = forcePopOut;
	}, [forcePopOut]);

	useEffect(() => {
		// Dynamically generate frame images to insulate them from React re-render diffs
		const sequence = sequenceRef.current;
		if (!sequence) return;

		sequence.innerHTML = '';
		frames.forEach((src, i) => {
			const img = document.createElement('img');
			img.src = src;
			img.className = `frame-img pointer-events-none select-none ${
				i === 0
					? 'relative block h-auto w-full opacity-100'
					: 'absolute top-0 left-0 block h-auto w-full opacity-0'
			}`;
			img.alt = '';
			img.loading = 'eager';
			img.draggable = false;
			img.decode().catch((err) => {
				console.debug('Failed to pre-decode sequence frame image', err);
			});
			sequence.appendChild(img);
		});
	}, [pngFolder]);

	useEffect(() => {
		if (forcePopOut) {
			handleMouseEnterRef.current();
		} else {
			if (!isHoveredRef.current) {
				handleMouseLeaveRef.current();
			}
		}
	}, [forcePopOut]);

	useEffect(() => {
		const container = containerRef.current;
		const sequence = sequenceRef.current;
		if (!container || !sequence) return;

		const imgs = sequence.querySelectorAll('.frame-img');
		if (imgs.length === 0) return;

		const state = { progress: 0 };
		// let currentFrame = 0;

		const updateFrame = () => {
			let p = state.progress;
			if (p === 1) p = 0.999;
			const nextFrame = Math.floor(p * imgs.length);

			for (let i = 0; i < imgs.length; i++) {
				if (i === nextFrame) {
					imgs[i]?.classList.remove('opacity-0');
					imgs[i]?.classList.add('opacity-100');
				} else {
					imgs[i]?.classList.remove('opacity-100');
					imgs[i]?.classList.add('opacity-0');
				}
			}
			// currentFrame = nextFrame;
		};

		// Set initial layout transform with GSAP
		gsap.set(sequence, {
			x: `${xAdjust}%`,
			y: `${yAdjust}%`,
			scaleX: scale[0],
			scaleY: scale[1],
			transformOrigin: `${origin[0]}% ${origin[1]}%`,
		});

		// Force sync initial state immediately on initialization
		updateFrame();

		let tween: gsap.core.Tween | null = null;

		const handleMouseEnter = () => {
			sequence.classList.remove('invisible');
			if (tween) tween.kill();
			gsap.killTweensOf(sequence);

			const duration = imgs.length / 24;

			gsap.set(sequence, { opacity: 1 });

			tween = gsap.to(state, {
				progress: 1,
				duration: duration,
				ease: 'none',
				onUpdate: updateFrame,
			});
		};

		const handleMouseLeave = () => {
			if (tween) tween.kill();
			gsap.killTweensOf(sequence);

			const duration = imgs.length / 24;

			tween = gsap.to(state, {
				progress: 0,
				duration: duration,
				ease: 'none',
				onUpdate: updateFrame,
				onComplete: () => {
					sequence.classList.add('invisible');
				},
			});

			gsap.to(sequence, {
				opacity: 0,
				duration: duration,
				ease: 'power1.in',
			});
		};

		handleMouseEnterRef.current = handleMouseEnter;
		handleMouseLeaveRef.current = handleMouseLeave;

		const onMouseEnter = () => {
			isHoveredRef.current = true;
			handleMouseEnter();
		};

		const onMouseLeave = () => {
			isHoveredRef.current = false;
			if (!forcePopOutRef.current) {
				handleMouseLeave();
			}
		};

		container.addEventListener('mouseenter', onMouseEnter);
		container.addEventListener('mouseleave', onMouseLeave);

		return () => {
			container.removeEventListener('mouseenter', onMouseEnter);
			container.removeEventListener('mouseleave', onMouseLeave);
			if (tween) tween.kill();
		};
	}, [pngFolder, xAdjust, yAdjust, scale, origin]);

	return (
		<div
			ref={containerRef}
			id={`footer-char-${id}`}
			className='group relative flex-1 cursor-pointer overflow-visible select-none'
			style={{ maxWidth: `${svgWidth}px` }}
		>
			{/* The Black SVG Background Box Silhouette */}
			<img
				src={svgPath}
				className='pointer-events-none block h-auto w-full transition-transform duration-300 select-none group-hover:scale-[1.02]'
				alt=''
				width={svgWidth}
				height={svgHeight}
				draggable={false}
			/>

			{/* The Hover Pop-Out Layer */}
			<div className='pointer-events-none absolute inset-x-0 bottom-0 overflow-visible'>
				<div
					ref={sequenceRef}
					className='pointer-events-none invisible relative w-full overflow-visible'
				/>
			</div>
		</div>
	);
};

export const Footer = () => {
	const [currentTime, setCurrentTime] = useState('--:--');
	const [isOfficeHours, setIsOfficeHours] = useState(true);
	const [isBookMeetingHovered, setIsBookMeetingHovered] = useState(false);

	useEffect(() => {
		const updateTime = () => {
			// Convert to Copenhagen CET/CEST time zone
			const formatter = new Intl.DateTimeFormat('en-US', {
				timeZone: 'Europe/Copenhagen',
				hour: '2-digit',
				minute: '2-digit',
				hour12: false,
				weekday: 'long',
			});

			// 💡 正确做法：传入一个 Date 对象
			const result = formatter.format(new Date());
			try {
				const parts = result.split(' ');
				const dayName = parts[0];
				const timeStr = parts[1];

				console.log(result, dayName, timeStr, 'result');

				if (timeStr) {
					setCurrentTime(timeStr);
					const [hourStr] = timeStr.split(':');
					const hour = parseInt(hourStr, 10);
					const isWeekend = dayName === 'Saturday' || dayName === 'Sunday';
					const inRange = hour >= 9 && hour < 17;
					setIsOfficeHours(!isWeekend && inRange);
				}
			} catch (e) {
				console.error('Failed to parse Copenhagen local time', e);
			}
		};

		updateTime();
		const timer = setInterval(updateTime, 10000);
		return () => clearInterval(timer);
	}, []);

	return (
		<footer
			id='contact'
			className='relative h-full min-h-screen overflow-hidden bg-[#502b1a] px-6 pt-16 text-white select-none md:px-12 md:pt-20'
		>
			{/* Watermark Logo Shape background */}
			<img
				src='/assets/ribbit_footer.svg'
				alt='ribbit-logo'
				className='pointer-events-none absolute inset-x-0 bottom-36 lg:bottom-28 h-auto max-h-[85%] w-full object-contain object-bottom opacity-[0.08] select-none'
				style={{
					WebkitMaskImage: 'linear-gradient(to bottom, black 15%, transparent 100%)',
					maskImage: 'linear-gradient(to bottom, black 15%, transparent 100%)',
				}}
			/>

			{/* Main Layout Wrap */}
			<div className='relative z-20 mx-auto flex h-full min-h-[86dvh] max-w-7xl flex-col justify-between'>
				{/* Top Column Grid */}
				<div className='flex flex-col items-start justify-center gap-12 md:flex-row md:items-start md:justify-end lg:gap-16'>
					{/* Column 1: Studio Contact Info & Clock */}
					<div className='flex flex-col gap-4 px-4 text-left'>
						<p className='max-w-xs text-sm leading-relaxed font-normal text-white/90'>
							{isOfficeHours ? (
								<>
									We are in our studio!
									<br />
									Contact us here:
								</>
							) : (
								<>
									We are gone for today.
									<br />
									Leave us a message:
								</>
							)}
						</p>

						<div className='flex flex-col gap-2.5 text-sm font-medium text-white'>
							<a
								href='mailto:howdy@ribbit.dk'
								className='group flex w-fit items-center gap-3 underline-offset-4 transition-colors hover:underline'
							>
								<span className='flex h-5 w-5 items-center justify-center text-white transition-colors'>
									<PiMailboxFill className='h-4.5 w-4.5' />
								</span>
								howdy@ribbit.dk
							</a>
							<a
								href='tel:+4581118186'
								className='group flex w-fit items-center gap-3 underline-offset-4 transition-colors hover:underline'
							>
								<span className='flex h-5 w-5 items-center justify-center text-white transition-colors'>
									<FiPhone className='h-4.5 w-4.5' />
								</span>
								+45 81 11 81 86
							</a>
							<div className='flex w-fit items-center gap-3 text-white'>
								<span className='flex h-5 w-5 items-center justify-center'>
									<FiClock className='h-4.5 w-4.5' />
								</span>
								<span>
									Local time: <span className='font-semibold text-white'>{currentTime}</span>{' '}
									<span className='text-xs font-thin text-white/60'>(GMT+1)</span>
								</span>
							</div>
						</div>

						<button
							type='button'
							className='mt-3 w-fit -skew-x-12 cursor-pointer rounded-md bg-[#ffd948] px-7 py-3.5 text-xs font-extrabold text-[#2f2f2f] shadow-lg shadow-black/15 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]'
							onMouseEnter={() => setIsBookMeetingHovered(true)}
							onMouseLeave={() => setIsBookMeetingHovered(false)}
						>
							<span className='tracking-wider uppercase'>Book a meeting</span>
						</button>
					</div>

					{/* Column 2: Social Navigation Links */}
					<div className='flex flex-col gap-3.5 px-4 text-left md:pt-1.5'>
						<a
							href='https://www.instagram.com/ribbit_studio'
							target='_blank'
							rel='noreferrer'
							className='group flex items-center gap-2 text-sm font-normal tracking-wider text-white uppercase underline-offset-4 transition-colors hover:underline'
						>
							Instagram
						</a>
						<a
							href='https://www.linkedin.com/company/ribbit-studio/'
							target='_blank'
							rel='noreferrer'
							className='group flex items-center gap-2 text-sm font-normal tracking-wider text-white uppercase underline-offset-4 transition-colors hover:underline'
						>
							LinkedIn
						</a>
					</div>
				</div>

				{/* Center Row: Interactive Character Boxes */}
				<div className='pointer-events-none absolute inset-x-0 bottom-10 z-10 hidden w-full overflow-visible md:block'>
					<div className='pointer-events-auto mx-auto flex max-w-7xl items-end justify-between gap-4 px-0 lg:gap-8'>
						<FooterCharacter
							id='explorer'
							svgPath='/assets/Footer/1.svg'
							svgWidth={191}
							svgHeight={272}
							pngFolder='/assets/footer_explorer/'
							length={9}
							xAdjust={-15}
							yAdjust={-17}
							scale={[1.16, 1.16]}
							origin={[0, 0]}
							forcePopOut={isBookMeetingHovered}
						/>
						<FooterCharacter
							id='outlaw'
							svgPath='/assets/Footer/2.svg'
							svgWidth={191}
							svgHeight={272}
							pngFolder='/assets/footer_outlaw/'
							length={11}
							xAdjust={0.5}
							yAdjust={0}
							scale={[0.6, 0.6]}
							origin={[100, 100]}
							forcePopOut={isBookMeetingHovered}
						/>
						<FooterCharacter
							id='jester'
							svgPath='/assets/Footer/3.svg'
							svgWidth={278}
							svgHeight={283}
							pngFolder='/assets/footer_jester/'
							length={10}
							xAdjust={-1}
							yAdjust={16.75}
							scale={[0.88, 0.88]}
							origin={[0, 0]}
							forcePopOut={isBookMeetingHovered}
						/>
						<FooterCharacter
							id='creator'
							svgPath='/assets/Footer/4.svg'
							svgWidth={127}
							svgHeight={229}
							pngFolder='/assets/footer_creator/'
							length={10}
							xAdjust={-0.5}
							yAdjust={-8}
							scale={[1.18, 1.18]}
							origin={[0, 100]}
							forcePopOut={isBookMeetingHovered}
						/>
						<FooterCharacter
							id='sage'
							svgPath='/assets/Footer/5.svg'
							svgWidth={232}
							svgHeight={198}
							pngFolder='/assets/footer_sage/'
							length={10}
							xAdjust={0.25}
							yAdjust={9.5}
							scale={[0.895, 0.895]}
							origin={[100, 100]}
							forcePopOut={isBookMeetingHovered}
						/>
					</div>
				</div>

				{/* Bottom Row: Meta details */}
				<div className='relative z-20 mt-auto flex w-full flex-col gap-4 pt-6 text-[11px] font-semibold text-white/50 md:flex-row md:items-center md:justify-between'>
					<a
						href='https://maps.app.goo.gl/2YYEgY11bQRJncck6'
						target='_blank'
						rel='noreferrer'
						className='flex items-center gap-2 transition-colors hover:text-white'
					>
						<FiMapPin className='h-4 w-4 shrink-0 text-white/40' />
						Esromgade 15, 2200 Copenhagen N. Denmark
					</a>
					<span className='text-left md:text-center'>
						© {new Date().getFullYear()} Ribbit ApS. All rights reserved.
					</span>
					<a
						href='/privacy-policy/'
						className='w-fit underline-offset-4 transition-colors hover:text-white hover:underline'
					>
						Privacy Policy
					</a>
					<p>Clone by yuqi</p>
				</div>
			</div>
		</footer>
	);
};
