import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FrameCanvas } from 'src/module/components/FrameCanvas';
import { clamp } from 'src/utils/clamp';

gsap.registerPlugin(ScrollTrigger);

// --- 类型定义 ---
type CharacterMode = 'idle' | 'pull' | 'push';
type CharacterKey = 'creator' | 'explorer' | 'jester' | 'outlaw';

type CharacterAsset = {
	counts: Record<CharacterMode, number>;
	folders: Record<CharacterMode, string>;
	reversePull?: boolean;
};

type DescItem = {
	character: CharacterKey;
	characterClassName: string;
	label: string;
	scatterX: number; // 初始偏移量，正值从右侧入场，负值从左侧入场
};

const DESC_SCROLL_DISTANCE = 700; // sticky wrapper approach: total scroll = 100dvh + this

const CHARACTER_ASSETS: Record<CharacterKey, CharacterAsset> = {
	creator: {
		counts: { idle: 51, pull: 40, push: 40 },
		folders: { idle: 'creator_idle', pull: 'creator_pull', push: 'creator_push' },
	},
	explorer: {
		counts: { idle: 40, pull: 40, push: 40 },
		folders: { idle: 'explorer_idle', pull: 'explorer_pull', push: 'explorer_push' },
	},
	jester: {
		counts: { idle: 51, pull: 58, push: 58 },
		folders: { idle: 'jester_idle_2', pull: 'jester_push_2', push: 'jester_push_2' },
		reversePull: true,
	},
	outlaw: {
		counts: { idle: 25, pull: 26, push: 24 },
		folders: { idle: 'outlaw_idle', pull: 'outlaw_pull', push: 'outlaw_push' },
	},
};

const DESC_ITEMS: DescItem[] = [
	{
		character: 'creator',
		characterClassName: 'top-0 -left-18 md:-left-22 lg:-left-30 w-[clamp(100px,14vw,200px)]',
		label: 'Curious',
		scatterX: 1, // Will be replaced dynamically by vw
	},
	{
		character: 'jester',
		characterClassName: '-right-30 md:-right-36 -bottom-10 w-[clamp(160px,24vw,320px)]',
		label: 'Fullservice',
		scatterX: -1, // Will be replaced dynamically by vw
	},
	{
		character: 'explorer',
		characterClassName: '-bottom-6 w-[clamp(90px,12vw,160px)]',
		label: 'Motion',
		scatterX: -1, // Will be replaced dynamically by vw
	},
	{
		character: 'outlaw',
		characterClassName: '-left-8 -bottom-8 w-[clamp(85px,11vw,150px)]',
		label: 'Agency',
		scatterX: 1, // Will be replaced dynamically by vw
	},
];

const getCharacterFramePath = (character: CharacterKey, mode: CharacterMode, frame: number) => {
	const asset = CHARACTER_ASSETS[character];
	const count = asset.counts[mode];
	const rawFrame = mode === 'pull' && asset.reversePull ? count - 1 - frame : frame;
	return `/assets/${asset.folders[mode]}/${String(rawFrame).padStart(3, '0')}.png`;
};

const DescWord = ({
	frame,
	item,
	mode,
	setRowRef,
	setTextRef,
}: {
	frame: number;
	item: DescItem;
	mode: CharacterMode;
	setRowRef: (label: string, node: HTMLDivElement | null) => void;
	setTextRef: (label: string, node: HTMLDivElement | null) => void;
}) => {
	const src = getCharacterFramePath(item.character, mode, frame);
	const fallbackSrc = getCharacterFramePath(item.character, 'idle', 0);

	return (
		<div
			ref={(node) => setRowRef(item.label, node)}
			className='relative flex w-fit items-center opacity-1 will-change-transform'
		>
			<div
				ref={(node) => setTextRef(item.label, node)}
				className='will-change-transform'
				style={{ transformOrigin: 'center bottom' }}
			>
				<span className='text-darkink block scale-x-85 scale-y-110 font-serif text-[clamp(4rem,14vw,13rem)] leading-[0.75] tracking-[-0.08em] select-none'>
					{item.label}
				</span>
			</div>
			<FrameCanvas
				src={src}
				fallbackSrc={fallbackSrc}
				alt={item.character}
				className={`pointer-events-none absolute z-10 h-auto select-none ${item.characterClassName}`}
			/>
		</div>
	);
};

export const RibbitDesc = () => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const sectionRef = useRef<HTMLElement>(null);
	const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const textRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const modesRef = useRef<Record<CharacterKey, CharacterMode>>({
		creator: 'idle',
		explorer: 'idle',
		jester: 'idle',
		outlaw: 'idle',
	});

	const [modes, setModes] = useState<Record<CharacterKey, CharacterMode>>({
		creator: 'idle',
		explorer: 'idle',
		jester: 'idle',
		outlaw: 'idle',
	});
	const frameTickRef = useRef(0);
	const isScrollingRef = useRef(false);
	const scrollTimeoutRef = useRef<number | null>(null);

	const [frames, setFrames] = useState<Record<CharacterKey, number>>({
		creator: 0,
		explorer: 0,
		jester: 0,
		outlaw: 0,
	});

	// 1. 序列帧更新
	useEffect(() => {
		const interval = window.setInterval(() => {
			frameTickRef.current += 1;
			setFrames((prev) => {
				const next = { ...prev };
				let changed = false;
				(Object.keys(next) as CharacterKey[]).forEach((key) => {
					const currentMode = modesRef.current[key];

					// Freeze push/pull animation if not currently scrolling
					if (currentMode !== 'idle' && !isScrollingRef.current) {
						return;
					}

					// Skip frame update on odd ticks to keep 'idle' twice as slow (90ms vs 45ms)
					if (currentMode === 'idle' && frameTickRef.current % 2 !== 0) {
						return;
					}
					next[key] = (next[key] + 1) % CHARACTER_ASSETS[key].counts[currentMode];
					changed = true;
				});
				return changed ? next : prev;
			});
		}, 45);
		return () => window.clearInterval(interval);
	}, []);

	// 2. 核心交互逻辑
	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			const vw = window.innerWidth;
			// dynamically set scatter distances based on viewport width to ensure they appear immediately upon scrolling
			const scatterOffsets = [
				-vw * 5, // Row 1: Curious (comes from left)
				vw * 5, // Row 2: Fullservice (comes from right)
				-vw * 5, // Row 3: Motion (comes from left)
				vw * 5, // Row 3: Agency (comes from right)
			];

			const quickTweens = DESC_ITEMS.map((item, index) => {
				const el = rowRefs.current[item.label];
				const textEl = textRefs.current[item.label];
				const scatterX = scatterOffsets[index];
				// 初始位置设置到刚好在屏幕外
				gsap.set(el, { x: scatterX, opacity: 1 });
				gsap.set(textEl, { skewX: 0 });

				return {
					el,
					scatterX: scatterX,
					x: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power2.out' }),
					textSkew: gsap.quickTo(textEl, 'skewX', { duration: 0.8, ease: 'power2.out' }),
				};
			});

			// Single trigger on wrapper — no GSAP pin, CSS sticky handles the lock.
			// start:'top bottom' = section enters viewport → animation begins immediately.
			// end:'bottom bottom' = wrapper bottom exits viewport = pin scroll done.
			// Subsequent sections are structurally below the wrapper; they cannot appear early.
			ScrollTrigger.create({
				trigger: wrapperRef.current,
				start: 'top bottom',
				end: 'bottom bottom',
				scrub: 1.5,
				onUpdate: (self) => {
					isScrollingRef.current = true;
					if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
					scrollTimeoutRef.current = window.setTimeout(() => {
						isScrollingRef.current = false;
					}, 100);

					const p = self.progress;
					const direction = self.direction;

					let modesChanged = false;
					const newModes = { ...modesRef.current };

					quickTweens.forEach((qt, index) => {
						const rowIdx = index === 3 ? 2 : index;
						const STAGGER_OFFSET = 0.18; // spread rows more across total progress
						const DURATION = 0.42; // each row animates over more scroll distance

						const startP = rowIdx * STAGGER_OFFSET;
						const endP = startP + DURATION;

						let localP = (p - startP) / (endP - startP);
						localP = clamp(localP, 0, 1);

						const isTransit = localP > 0.01 && localP < 0.99;
						const character = DESC_ITEMS[index].character;
						// Character plays push/pull frames if in transit, otherwise idle
						const expectedMode = isTransit ? (direction === 1 ? 'push' : 'pull') : 'idle';

						if (newModes[character] !== expectedMode) {
							newModes[character] = expectedMode;
							modesChanged = true;
						}

						const moveProgress = gsap.parseEase('power3.out')(localP);
						const baseX = qt.scatterX * (1 - moveProgress);

						// "推的时候向外倒，拉的时候向内倒"
						const inertiaDirection = Math.sign(qt.scatterX || 1);

						// Calculate a smooth tilt factor based purely on scroll progress (trapezoid function).
						// This ensures it starts upright (0), smoothly tilts, holds the tilt, and smoothly sets down.
						let tiltFactor = 0;
						if (localP <= 0 || localP >= 1) {
							tiltFactor = 0;
						} else if (localP < 0.15) {
							// Ramp up during the first 15% of the movement
							tiltFactor = localP / 0.15;
						} else if (localP > 0.85) {
							// Ramp down during the last 15% of the movement
							tiltFactor = (1 - localP) / 0.15;
						} else {
							// Hold steady in the middle
							tiltFactor = 1;
						}

						// "不那么倾斜": Set maximum tilt to 15 degrees (gentle lean)
						const targetSkew = 25 * tiltFactor * inertiaDirection * self.direction;

						qt.x(baseX);
						qt.textSkew(targetSkew);
					});

					if (modesChanged) {
						modesRef.current = newModes;
						setModes(newModes);
					}
				},
			});
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	return (
		<div id='about' className='flex w-full flex-col'>
			<div ref={wrapperRef} style={{ height: `calc(100dvh + ${DESC_SCROLL_DISTANCE}px)` }}>
				<section ref={sectionRef} className='sticky top-0 z-10 h-dvh overflow-hidden'>
					<div className='pointer-events-none relative flex h-full w-full flex-col items-center justify-between py-6 sm:py-10'>
						{/* Header */}
						<div className='shrink-0'>
							<img src='/assets/ribbit_is_a.svg' className='w-24 md:w-32' alt='' />
						</div>

						<div className='flex min-h-0 w-full flex-1 flex-col items-center gap-2 py-6 sm:gap-4 sm:py-10'>
							{/* Row 1: Curious */}
							<div className='flex min-h-0 w-full flex-1 items-center justify-center overflow-visible'>
								<DescWord
									item={DESC_ITEMS[0]}
									mode={modes['creator']}
									frame={frames['creator']}
									setRowRef={(l, n) => (rowRefs.current[l] = n)}
									setTextRef={(l, n) => (textRefs.current[l] = n)}
								/>
							</div>

							{/* Row 2: Fullservice */}
							<div className='from-darkink/0 to-darkink/5 flex min-h-0 w-full flex-1 items-center justify-center overflow-visible bg-linear-to-t'>
								<DescWord
									item={DESC_ITEMS[1]}
									mode={modes['jester']}
									frame={frames['jester']}
									setRowRef={(l, n) => (rowRefs.current[l] = n)}
									setTextRef={(l, n) => (textRefs.current[l] = n)}
								/>
							</div>

							{/* Row 3: Motion & Agency */}
							<div className='from-darkink/0 to-darkink/5 flex min-h-0 w-full max-w-360 flex-1 items-center justify-center overflow-visible bg-linear-to-t px-10 md:px-32'>
								<DescWord
									item={DESC_ITEMS[2]}
									mode={modes['explorer']}
									frame={frames['explorer']}
									setRowRef={(l, n) => (rowRefs.current[l] = n)}
									setTextRef={(l, n) => (textRefs.current[l] = n)}
								/>
								<DescWord
									item={DESC_ITEMS[3]}
									mode={modes['outlaw']}
									frame={frames['outlaw']}
									setRowRef={(l, n) => (rowRefs.current[l] = n)}
									setTextRef={(l, n) => (textRefs.current[l] = n)}
								/>
							</div>
						</div>
					</div>
				</section>
			</div>

			{/* Footer extracted from sticky section to give distance */}
			<div className='relative z-20 flex w-full flex-col items-center justify-center gap-10 pt-8 pb-36'>
				<img src='/assets/based_in_cph.svg' className='w-50 md:w-60' alt='' />

				<button className='border-darkink hover:bg-darkink hover:text-lightgrey pointer-events-auto -skew-x-12 rounded-md border p-2 text-sm font-semibold uppercase transition-colors'>
					Ribbit Who?
				</button>
			</div>
		</div>
	);
};
