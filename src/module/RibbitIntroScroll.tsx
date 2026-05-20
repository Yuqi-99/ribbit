import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Modal } from 'src/module/components/Modal';
import { createPortal } from 'react-dom';

gsap.registerPlugin(ScrollTrigger);

const SAGE_FRAME_COUNTS = {
	sage_pull: 25,
	sage_push: 174,
} as const;

type SageFolder = keyof typeof SAGE_FRAME_COUNTS;

const PUSH_START_FRAME = 15;

const PIN_SCROLL_DISTANCE = 300;
const COMPACT_VIDEO_WIDTH_VW = 22;
const COMPACT_PADDING_TOP = 24;
const COMPACT_PADDING_RIGHT = 28;

const getFramePath = (folder: SageFolder, index: number) =>
	`/assets/${folder}/${String(index).padStart(3, '0')}.png`;

const INTRO_PLAYBACK_ID = 'xNEVeKx007rd6D3rNgrsN014Fx6st6WGlC4pz01O6ssnxI';
const INTRO_VIDEO_SOURCES = [
	`https://stream.mux.com/${INTRO_PLAYBACK_ID}/highest.mp4`,
	`https://stream.mux.com/${INTRO_PLAYBACK_ID}/high.mp4`,
	`https://stream.mux.com/${INTRO_PLAYBACK_ID}/medium.mp4`,
	`https://stream.mux.com/${INTRO_PLAYBACK_ID}/low.mp4`,
	`https://stream.mux.com/${INTRO_PLAYBACK_ID}.m3u8`,
];

type IntroVideoProps = {
	className?: string;
	controls?: boolean;
};

const IntroVideo = ({ className, controls = false }: IntroVideoProps) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const [sourceIndex, setSourceIndex] = useState(0);
	const source = INTRO_VIDEO_SOURCES[sourceIndex];

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		video.load();
		const promise = video.play();

		if (promise !== undefined) {
			promise.catch((error) => {
				console.log('Video playback was prevented:', error);
			});
		}
	}, [source]);

	return (
		<video
			ref={videoRef}
			autoPlay
			controls={controls}
			loop
			muted
			playsInline
			src={source}
			className={className}
			onError={() => {
				setSourceIndex((index) => (index < INTRO_VIDEO_SOURCES.length - 1 ? index + 1 : index));
			}}
		/>
	);
};

export const RibbitIntroScroll = () => {
	const sectionRef = useRef<HTMLElement | null>(null);
	const stageRef = useRef<HTMLDivElement | null>(null);
	const groupRef = useRef<HTMLDivElement | null>(null);
	const videoRef = useRef<HTMLDivElement | null>(null);
	const characterRef = useRef<HTMLImageElement | null>(null);
	const pullTweenRef = useRef<gsap.core.Tween | null>(null);
	const isPullPlayingRef = useRef(false);
	// pull 只在「从 push 完成态往回滑」时触发一次
	const hasPlayedPullRef = useRef(false);
	const compactStateRef = useRef<{
		group: { x: number; y: number; scale: number };
	} | null>(null);
	const [characterFolder, setCharacterFolder] = useState<SageFolder>('sage_push');
	const [frame, setFrame] = useState(0);
	const [openModal, setOpenModal] = useState(false);

	const preloadFrames = useMemo(
		() =>
			(Object.keys(SAGE_FRAME_COUNTS) as SageFolder[]).flatMap((folder) =>
				Array.from({ length: SAGE_FRAME_COUNTS[folder] }, (_, i) => getFramePath(folder, i))
			),
		[]
	);

	useLayoutEffect(() => {
		preloadFrames.forEach((src) => {
			const img = new Image();
			img.src = src;
		});
	}, [preloadFrames]);

	useLayoutEffect(() => {
		const section = sectionRef.current;
		const stage = stageRef.current;
		const group = groupRef.current;
		const video = videoRef.current;
		const character = characterRef.current;

		if (!section || !stage || !group || !video || !character) return;

		const calcCompactState = () => {
			const stageW = stage.clientWidth;
			const compactVideoW = (COMPACT_VIDEO_WIDTH_VW / 100) * window.innerWidth;
			const groupScale = compactVideoW / video.offsetWidth;
			const scaledGroupW = group.offsetWidth * groupScale;
			const groupTargetX = stageW - COMPACT_PADDING_RIGHT - scaledGroupW - group.offsetLeft;
			const groupTargetY = COMPACT_PADDING_TOP - group.offsetTop;
			compactStateRef.current = {
				group: { x: groupTargetX, y: groupTargetY, scale: groupScale },
			};
		};

		const context = gsap.context(() => {
			gsap.set(group, { x: 0, y: 0, scale: 1, transformOrigin: 'top left' });
			gsap.set(character, { scale: 1, transformOrigin: 'bottom right', zIndex: 20 });

			ScrollTrigger.addEventListener('refreshInit', calcCompactState);
			calcCompactState();

			ScrollTrigger.create({
				trigger: section,
				start: 'top top',
				end: `+=${PIN_SCROLL_DISTANCE}`,
				pin: true,
				anticipatePin: 1,
				onUpdate: (self) => {
					const compact = compactStateRef.current;
					if (!compact) return;

					const p = self.progress;
					const isPushing = self.direction >= 0;
					const groupScale = 1 + (compact.group.scale - 1) * p;
					const charCounterScale = 1 / groupScale;

					// 视觉动画不变
					gsap.to(group, {
						x: compact.group.x * p,
						y: compact.group.y * p,
						scale: groupScale,
						duration: 0.16,
						ease: 'power1.out',
						overwrite: 'auto',
					});
					gsap.to(character, {
						scale: charCounterScale,
						duration: 0.16,
						ease: 'power1.out',
						overwrite: 'auto',
					});
					gsap.to('.intro-copy', {
						y: -70 * p,
						opacity: 1 - 0.75 * p,
						duration: 0.16,
						ease: 'power1.out',
					});

					if (isPushing) {
						// ✅ 往下滑：kill pull，立刻接回 push frame
						if (isPullPlayingRef.current || hasPlayedPullRef.current) {
							pullTweenRef.current?.kill();
							isPullPlayingRef.current = false;
							hasPlayedPullRef.current = false;
							gsap.set(character, { zIndex: 20, opacity: 1 });
						}

						setCharacterFolder('sage_push');
						// frame 从当前 progress 对应位置开始，不从头
						// setFrame(Math.floor(p * (SAGE_FRAME_COUNTS.sage_push - 1)));
						setFrame(
							PUSH_START_FRAME +
								Math.floor(p * (SAGE_FRAME_COUNTS.sage_push - 1 - PUSH_START_FRAME))
						);
					} else {
						// ✅ 往上滑：只要没播过就触发 pull，没有阈值
						if (!hasPlayedPullRef.current) {
							hasPlayedPullRef.current = true;
							isPullPlayingRef.current = true;
							pullTweenRef.current?.kill();
							setCharacterFolder('sage_pull');

							const frameState = { frame: 0 };
							pullTweenRef.current = gsap.to(frameState, {
								frame: SAGE_FRAME_COUNTS.sage_pull - 1,
								duration: 0.72,
								ease: 'steps(24)',
								onStart: () => {
									gsap.set(character, { zIndex: 5, opacity: 0.1, x: '+=26' });
									gsap.to(character, {
										opacity: 1,
										x: '-=26',
										duration: 0.22,
										ease: 'power2.out',
									});
								},
								onUpdate: () => setFrame(Math.round(frameState.frame)),
								onComplete: () => {
									isPullPlayingRef.current = false;
									gsap.set(character, { zIndex: 20, opacity: 1 });
									// pull 播完：停在最后一帧，等用户下一步操作
								},
							});
						}
						// pull 播放中或播完：什么都不做，保持当前 pull 帧
					}
				},
			});
		}, stage);

		return () => {
			pullTweenRef.current?.kill();
			ScrollTrigger.removeEventListener('refreshInit', calcCompactState);
			context.revert();
		};
	}, []);

	return (
		<>
			<section
				ref={sectionRef}
				id='intro'
				className='relative flex w-full items-start overflow-hidden px-4'
			>
				<div ref={stageRef} className='relative mx-auto h-[min(700px,70dvh)] w-full max-w-360'>
					<div
						ref={groupRef}
						className='absolute top-8 right-0 flex items-end'
						// style={{ transformOrigin: 'top left' }}
					>
						<img
							ref={characterRef}
							src={getFramePath(characterFolder, frame)}
							alt='Sage character pushing the video'
							className='pointer-events-none relative z-20 h-auto w-[clamp(120px,18vw,260px)] shrink-0 select-none'
							// style={{ transformOrigin: 'bottom right' }}
							draggable={false}
						/>
						<div
							ref={videoRef}
							className='bg-darkink relative top-8 z-10 aspect-video w-[min(58vw,700px)] shrink-0 overflow-hidden rounded-lg'
						>
							<IntroVideo className='absolute inset-0 h-full w-full object-contain' />
							<div className='absolute inset-0 grid place-items-center'>
								<button
									type='button'
									aria-label='Play intro video'
									className='text-darkink grid h-16 w-16 cursor-pointer place-items-center rounded-full bg-white/92 shadow-[0_12px_36px_rgba(0,0,0,0.22)] transition-transform hover:scale-105'
									onClick={() => {
										setOpenModal(true);
										console.log('click');
									}}
								>
									<span className='border-l-darkink ml-1 h-0 w-0 border-y-10 border-l-16 border-y-transparent' />
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>
			{createPortal(
				<Modal opened={openModal} onClose={() => setOpenModal(false)} blur={true}>
					<IntroVideo controls className='aspect-video h-full w-full object-cover' />
				</Modal>,
				document.body
			)}
		</>
	);
};
