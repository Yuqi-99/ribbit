import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

const DESC_SCROLL_DISTANCE = 500; // sticky wrapper approach: total scroll = 100dvh + this
const IDLE_DELAY = 120;

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
		characterClassName: '-top-16 left-0 w-[clamp(100px,14vw,200px)]',
		label: 'Curious',
		scatterX: 1, // Will be replaced dynamically by vw
	},
	{
		character: 'jester',
		characterClassName: '-right-36 -bottom-10 w-[clamp(160px,24vw,320px)]',
		label: 'Fullservice',
		scatterX: -1, // Will be replaced dynamically by vw
	},
	{
		character: 'explorer',
		characterClassName: '-right-10 -bottom-6 w-[clamp(90px,12vw,160px)]',
		label: 'Motion',
		scatterX: -1, // Will be replaced dynamically by vw
	},
	{
		character: 'outlaw',
		characterClassName: '-left-16 -bottom-8 w-[clamp(85px,11vw,150px)]',
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
}: {
	frame: number;
	item: DescItem;
	mode: CharacterMode;
	setRowRef: (label: string, node: HTMLDivElement | null) => void;
}) => (
	<div
		ref={(node) => setRowRef(item.label, node)}
		className='relative flex w-fit items-center opacity-1 will-change-transform'
		style={{ transformOrigin: 'center bottom' }}
	>
		<span className='text-darkink scale-x-85 scale-y-110 font-serif text-[clamp(4rem,14vw,13rem)] leading-[0.75] tracking-[-0.08em] select-none'>
			{item.label}
		</span>
		<img
			src={getCharacterFramePath(item.character, mode, frame)}
			alt={item.character}
			className={`pointer-events-none absolute z-10 h-auto select-none ${item.characterClassName}`}
			draggable={false}
		/>
	</div>
);

export const RibbitDesc = () => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const sectionRef = useRef<HTMLElement>(null);
	const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const modeRef = useRef<CharacterMode>('idle');
	const idleTimerRef = useRef<number | null>(null);

	const [mode, setMode] = useState<CharacterMode>('idle');
	const [frames, setFrames] = useState<Record<CharacterKey, number>>({
		creator: 0,
		explorer: 0,
		jester: 0,
		outlaw: 0,
	});

	// 1. 序列帧更新
	useEffect(() => {
		const interval = window.setInterval(
			() => {
				setFrames((prev) => {
					const next = { ...prev };
					(Object.keys(next) as CharacterKey[]).forEach((key) => {
						next[key] = (next[key] + 1) % CHARACTER_ASSETS[key].counts[modeRef.current];
					});
					return next;
				});
			},
			mode === 'idle' ? 100 : 45
		);
		return () => window.clearInterval(interval);
	}, [mode]);

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
				const scatterX = scatterOffsets[index];
				// 初始位置设置到刚好在屏幕外
				gsap.set(el, { x: scatterX, opacity: 1 });

				return {
					el,
					scatterX: scatterX,
					x: gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power2.out' }),
					skew: gsap.quickTo(el, 'skewX', { duration: 0.8, ease: 'power2.out' }),
				};
			});

			const resetToIdle = () => {
				modeRef.current = 'idle';
				setMode('idle');
				quickTweens.forEach((qt) => qt.skew(0));
			};

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
					const p = self.progress;
					const vel = self.getVelocity();
					const direction = self.direction;

					// 状态切换
					if (Math.abs(vel) > 15) {
						const newMode = direction === 1 ? 'push' : 'pull';
						if (modeRef.current !== newMode) {
							modeRef.current = newMode;
							setMode(newMode);
						}
						if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
						idleTimerRef.current = window.setTimeout(resetToIdle, IDLE_DELAY);
					}

					quickTweens.forEach((qt, index) => {
						const rowIdx = index === 3 ? 2 : index;
						const STAGGER_OFFSET = 0.18; // spread rows more across total progress
						const DURATION = 0.42; // each row animates over more scroll distance

						const startP = rowIdx * STAGGER_OFFSET;
						const endP = startP + DURATION;

						let localP = (p - startP) / (endP - startP);
						localP = clamp(localP, 0, 1);

						const moveProgress = gsap.parseEase('power3.out')(localP);
						const baseX = qt.scatterX * (1 - moveProgress);
						const targetSkew = clamp(vel / 50, -55, 55);

						qt.x(baseX);
						qt.skew(targetSkew);
					});
				},
			});
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	return (
		<div ref={wrapperRef} style={{ height: `calc(100dvh + ${DESC_SCROLL_DISTANCE}px)` }}>
			<section ref={sectionRef} className='sticky top-0 z-10 h-dvh overflow-hidden'>
				<div className='pointer-events-none relative flex h-full w-full flex-col items-center justify-between py-4'>
					{/* Header */}
					<img src='/assets/ribbit_is_a.svg' className='w-24 md:w-32' alt='' />

					<div className='flex w-full flex-col items-center gap-4'>
						{/* Row 1: Curious */}
						<div className='flex h-[22vh] w-full items-center justify-center overflow-visible'>
							<DescWord
								item={DESC_ITEMS[0]}
								mode={mode}
								frame={frames['creator']}
								setRowRef={(l, n) => (rowRefs.current[l] = n)}
							/>
						</div>

						{/* Row 2: Fullservice */}
						<div className='flex h-[22vh] w-full items-center justify-center overflow-visible'>
							<DescWord
								item={DESC_ITEMS[1]}
								mode={mode}
								frame={frames['jester']}
								setRowRef={(l, n) => (rowRefs.current[l] = n)}
							/>
						</div>

						{/* Row 3: Motion & Agency */}
						<div className='flex h-[22vh] w-full max-w-360 items-center justify-between overflow-visible px-10 md:px-32'>
							<DescWord
								item={DESC_ITEMS[2]}
								mode={mode}
								frame={frames['explorer']}
								setRowRef={(l, n) => (rowRefs.current[l] = n)}
							/>
							<DescWord
								item={DESC_ITEMS[3]}
								mode={mode}
								frame={frames['outlaw']}
								setRowRef={(l, n) => (rowRefs.current[l] = n)}
							/>
						</div>
					</div>

					{/* Footer */}
					<img src='/assets/based_in_cph.svg' className='w-50 md:w-60' alt='' />

					<button className='border-darkink -skew-x-12 rounded-md border p-2 text-sm font-semibold uppercase'>
						Ribbit Who?
					</button>
				</div>
			</section>
		</div>
	);
};
