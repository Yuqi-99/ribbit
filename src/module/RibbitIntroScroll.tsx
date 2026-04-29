/* eslint-disable @typescript-eslint/no-unused-vars */
// import { useLayoutEffect, useMemo, useRef, useState } from 'react';

// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger);

// const SAGE_FRAME_COUNTS = {
// 	sage_pull: 25,
// 	sage_push: 174,
// } as const;

// type SageFolder = keyof typeof SAGE_FRAME_COUNTS;

// const PIN_SCROLL_DISTANCE = 300;
// const COMPACT_VIDEO_WIDTH = 170;
// const COMPACT_VIDEO_TOP = 24;
// const COMPACT_VIDEO_RIGHT = 28;

// const getFramePath = (folder: SageFolder, index: number) =>
// 	`/assets/${folder}/${String(index).padStart(3, '0')}.png`;

// export const RibbitIntroScroll = () => {
// 	const sectionRef = useRef<HTMLElement | null>(null);
// 	const stageRef = useRef<HTMLDivElement | null>(null);
// 	const videoRef = useRef<HTMLDivElement | null>(null);
// 	const characterRef = useRef<HTMLImageElement | null>(null);
// 	const frameCursorRef = useRef<Record<SageFolder, number>>({ sage_pull: 0, sage_push: 0 });
// 	const pullTweenRef = useRef<gsap.core.Tween | null>(null);
// 	const isPullPlayingRef = useRef(false);
// 	const hasPlayedPullForGestureRef = useRef(false);
// 	const [characterFolder, setCharacterFolder] = useState<SageFolder>('sage_push');
// 	const [frame, setFrame] = useState(0);

// 	const preloadFrames = useMemo(
// 		() =>
// 			(Object.keys(SAGE_FRAME_COUNTS) as SageFolder[]).flatMap((folder) =>
// 				Array.from({ length: SAGE_FRAME_COUNTS[folder] }, (_, index) => getFramePath(folder, index))
// 			),
// 		[]
// 	);

// 	useLayoutEffect(() => {
// 		preloadFrames.forEach((src) => {
// 			const image = new Image();
// 			image.src = src;
// 		});
// 	}, [preloadFrames]);

// 	useLayoutEffect(() => {
// 		const section = sectionRef.current;
// 		const stage = stageRef.current;
// 		const video = videoRef.current;
// 		const character = characterRef.current;

// 		if (!section || !stage || !video || !character) {
// 			return;
// 		}

// 		const context = gsap.context(() => {
// 			const getCompactVideoState = () => {
// 				const startLeft = video.offsetLeft;
// 				const startTop = video.offsetTop;
// 				const compactLeft = stage.clientWidth - COMPACT_VIDEO_WIDTH - COMPACT_VIDEO_RIGHT;

// 				return {
// 					x: compactLeft - startLeft,
// 					y: COMPACT_VIDEO_TOP - startTop,
// 					scale: COMPACT_VIDEO_WIDTH / video.offsetWidth,
// 				};
// 			};

// 			const setPushFrame = (progress: number, velocity: number) => {
// 				const velocityStep = Math.max(1, Math.min(8, Math.abs(velocity) / 380));
// 				frameCursorRef.current.sage_push += velocityStep;

// 				setCharacterFolder('sage_push');
// 				setFrame(
// 					Math.floor(frameCursorRef.current.sage_push + progress * 18) % SAGE_FRAME_COUNTS.sage_push
// 				);
// 			};

// 			const playPullOnce = () => {
// 				if (isPullPlayingRef.current || hasPlayedPullForGestureRef.current) {
// 					return;
// 				}

// 				pullTweenRef.current?.kill();
// 				isPullPlayingRef.current = true;
// 				hasPlayedPullForGestureRef.current = true;
// 				setCharacterFolder('sage_pull');

// 				const frameState = { frame: 0 };

// 				pullTweenRef.current = gsap.to(frameState, {
// 					frame: SAGE_FRAME_COUNTS.sage_pull - 1,
// 					duration: 0.72,
// 					ease: 'steps(24)',
// 					onStart: () => {
// 						gsap.set(character, { zIndex: 5, opacity: 0.1, x: '+=26' });
// 						gsap.to(character, {
// 							opacity: 1,
// 							x: '-=26',
// 							duration: 0.22,
// 							ease: 'power2.out',
// 						});
// 					},
// 					onUpdate: () => {
// 						setFrame(Math.round(frameState.frame));
// 					},
// 					onComplete: () => {
// 						isPullPlayingRef.current = false;
// 						gsap.set(character, { zIndex: 20, opacity: 1 });
// 					},
// 				});
// 			};

// 			gsap.set(video, { x: 0, y: 0, scale: 1, rotate: 0, transformOrigin: 'top left' });
// 			gsap.set(character, { xPercent: 0, zIndex: 20 });

// 			ScrollTrigger.create({
// 				trigger: section,
// 				start: 'top top',
// 				end: `+=${PIN_SCROLL_DISTANCE}`,
// 				pin: true,
// 				anticipatePin: 1,
// 				onUpdate: (self) => {
// 					const isPushing = self.direction >= 0;

// 					if (isPushing) {
// 						pullTweenRef.current?.kill();
// 						isPullPlayingRef.current = false;
// 						hasPlayedPullForGestureRef.current = false;
// 						gsap.set(character, { zIndex: 20, opacity: 1 });

// 						const compactVideo = getCompactVideoState();

// 						gsap.to(video, {
// 							x: compactVideo.x * self.progress,
// 							y: compactVideo.y * self.progress,
// 							scale: 1 + (compactVideo.scale - 1) * self.progress,
// 							duration: 0.16,
// 							ease: 'power1.out',
// 							overwrite: 'auto',
// 						});
// 						gsap.to(character, {
// 							x: compactVideo.x * self.progress,
// 							y: compactVideo.y * self.progress,
// 							scale: 1,
// 							duration: 0.16,
// 							ease: 'power1.out',
// 							overwrite: 'auto',
// 						});
// 						gsap.to('.intro-copy', {
// 							y: -70 * self.progress,
// 							opacity: 1 - 0.75 * self.progress,
// 							duration: 0.16,
// 							ease: 'power1.out',
// 						});
// 						setPushFrame(self.progress, self.getVelocity());
// 						return;
// 					}

// 					gsap.to(video, {
// 						x: 0,
// 						y: 0,
// 						scale: 1,
// 						rotate: 0,
// 						duration: 0.28,
// 						ease: 'power3.out',
// 						overwrite: 'auto',
// 					});
// 					gsap.to(character, {
// 						x: 0,
// 						y: 0,
// 						scale: 1,
// 						duration: 0.28,
// 						ease: 'power3.out',
// 						overwrite: 'auto',
// 					});
// 					gsap.to('.intro-copy', {
// 						y: 0,
// 						opacity: 1,
// 						duration: 0.28,
// 						ease: 'power3.out',
// 					});
// 					playPullOnce();
// 				},
// 			});
// 		}, stage);

// 		return () => {
// 			pullTweenRef.current?.kill();
// 			context.revert();
// 		};
// 	}, []);

// 	return (
// 		<section
// 			ref={sectionRef}
// 			id='projects'
// 			className='relative flex min-h-svh w-full items-center overflow-hidden px-5 md:px-8'
// 		>
// 			<div ref={stageRef} className='relative mx-auto h-[min(760px,82svh)] w-full max-w-360'>
// 				<div
// 					ref={videoRef}
// 					className='bg-darkink absolute top-0 left-[21%] z-10 aspect-video w-[min(72vw,820px)] overflow-hidden rounded-lg border shadow-[0_30px_90px_rgba(47,47,47,0.28)] md:top-0 md:left-[24%] xl:left-[40%]'
// 				>
// 					<video
// 						autoPlay
// 						muted
// 						loop
// 						playsInline
// 						src='https://stream.mux.com/xNEVeKx007rd6D3rNgrsN014Fx6st6WGlC4pz01O6ssnxI.m3u8'
// 						className='absolute inset-0 h-full w-full object-cover'
// 					/>
// 					<div className='absolute inset-0 grid place-items-center'>
// 						<button
// 							type='button'
// 							aria-label='Play intro video'
// 							className='text-darkink grid h-16 w-16 place-items-center rounded-full bg-white/92 shadow-[0_12px_36px_rgba(0,0,0,0.22)] transition-transform hover:scale-105'
// 						>
// 							<span className='border-l-darkink ml-1 h-0 w-0 border-y-10 border-l-16 border-y-transparent' />
// 						</button>
// 					</div>
// 				</div>

// 				<img
// 					ref={characterRef}
// 					src={getFramePath(characterFolder, frame)}
// 					alt='Sage character pushing the video'
// 					className='pointer-events-none absolute top-8 left-0 z-20 h-auto w-[clamp(150px,24vw,310px)] select-none md:left-0 xl:left-[17%]'
// 					draggable={false}
// 				/>
// 			</div>
// 		</section>
// 	);
// };

// 第二版
// import { useLayoutEffect, useMemo, useRef, useState } from 'react';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger);

// const SAGE_FRAME_COUNTS = {
// 	sage_pull: 25,
// 	sage_push: 174,
// } as const;

// type SageFolder = keyof typeof SAGE_FRAME_COUNTS;

// const PIN_SCROLL_DISTANCE = 300;

// // 最终停留的 compact 尺寸，用 vw 单位更灵活
// const COMPACT_VIDEO_WIDTH_VW = 22; // vw
// const COMPACT_PADDING_TOP = 24; // px from stage top
// const COMPACT_PADDING_RIGHT = 28; // px from stage right

// const getFramePath = (folder: SageFolder, index: number) =>
// 	`/assets/${folder}/${String(index).padStart(3, '0')}.png`;

// export const RibbitIntroScroll = () => {
// 	const sectionRef = useRef<HTMLElement | null>(null);
// 	const stageRef = useRef<HTMLDivElement | null>(null);
// 	// ✅ 新增：用一个 groupRef 包住 video + character
// 	const groupRef = useRef<HTMLDivElement | null>(null);
// 	const videoRef = useRef<HTMLDivElement | null>(null);
// 	const characterRef = useRef<HTMLImageElement | null>(null);
// 	const frameCursorRef = useRef<Record<SageFolder, number>>({ sage_pull: 0, sage_push: 0 });
// 	const pullTweenRef = useRef<gsap.core.Tween | null>(null);
// 	const isPullPlayingRef = useRef(false);
// 	const hasPlayedPullForGestureRef = useRef(false);
// 	// ✅ 缓存最终状态，只在 resize 时重算
// 	const compactStateRef = useRef<{ x: number; y: number; scale: number } | null>(null);

// 	const [characterFolder, setCharacterFolder] = useState<SageFolder>('sage_push');
// 	const [frame, setFrame] = useState(0);

// 	const preloadFrames = useMemo(
// 		() =>
// 			(Object.keys(SAGE_FRAME_COUNTS) as SageFolder[]).flatMap((folder) =>
// 				Array.from({ length: SAGE_FRAME_COUNTS[folder] }, (_, index) => getFramePath(folder, index))
// 			),
// 		[]
// 	);

// 	useLayoutEffect(() => {
// 		preloadFrames.forEach((src) => {
// 			const image = new Image();
// 			image.src = src;
// 		});
// 	}, [preloadFrames]);

// 	useLayoutEffect(() => {
// 		const section = sectionRef.current;
// 		const stage = stageRef.current;
// 		const group = groupRef.current;
// 		const video = videoRef.current;
// 		const character = characterRef.current;

// 		if (!section || !stage || !group || !video || !character) return;

// 		// ✅ 计算 compact 状态：group 整体移到右上角
// 		//    group 的左边缘 = stage 左边缘 + group.offsetLeft
// 		//    目标：video 缩放后右边对齐 stage 右边 - padding
// 		const calcCompactState = () => {
// 			const stageW = stage.clientWidth;
// 			const compactVideoW = (COMPACT_VIDEO_WIDTH_VW / 100) * window.innerWidth;
// 			const finalScale = compactVideoW / video.offsetWidth;

// 			// group 当前在 stage 中的位置
// 			const groupLeft = group.offsetLeft;
// 			const groupTop = group.offsetTop;

// 			// 缩放后 group 的视觉宽度（video 主导 group 宽度）
// 			// 目标 x：让 video 右边 = stageW - padding
// 			// video 在 group 内 offsetLeft = character 宽度（character 在左侧）
// 			// const videoOffsetInGroup = video.offsetLeft; // character 占据的宽度
// 			const scaledGroupW = group.offsetWidth * finalScale;
// 			// 我们希望缩放后 group 的右边缘 = stageW - COMPACT_PADDING_RIGHT
// 			const targetGroupRight = stageW - COMPACT_PADDING_RIGHT;
// 			const targetX = targetGroupRight - scaledGroupW - groupLeft;

// 			// 目标 y：让 group 顶部 = COMPACT_PADDING_TOP
// 			const targetY = COMPACT_PADDING_TOP - groupTop;

// 			compactStateRef.current = { x: targetX, y: targetY, scale: finalScale };
// 		};

// 		const setPushFrame = (progress: number, velocity: number) => {
// 			const velocityStep = Math.max(1, Math.min(8, Math.abs(velocity) / 380));
// 			frameCursorRef.current.sage_push += velocityStep;
// 			setCharacterFolder('sage_push');
// 			setFrame(
// 				Math.floor(frameCursorRef.current.sage_push + progress * 18) % SAGE_FRAME_COUNTS.sage_push
// 			);
// 		};

// 		const playPullOnce = () => {
// 			if (isPullPlayingRef.current || hasPlayedPullForGestureRef.current) return;

// 			pullTweenRef.current?.kill();
// 			isPullPlayingRef.current = true;
// 			hasPlayedPullForGestureRef.current = true;
// 			setCharacterFolder('sage_pull');

// 			const frameState = { frame: 0 };
// 			pullTweenRef.current = gsap.to(frameState, {
// 				frame: SAGE_FRAME_COUNTS.sage_pull - 1,
// 				duration: 0.72,
// 				ease: 'steps(24)',
// 				onStart: () => {
// 					gsap.set(character, { zIndex: 5, opacity: 0.1, x: '+=26' });
// 					gsap.to(character, { opacity: 1, x: '-=26', duration: 0.22, ease: 'power2.out' });
// 				},
// 				onUpdate: () => setFrame(Math.round(frameState.frame)),
// 				onComplete: () => {
// 					isPullPlayingRef.current = false;
// 					gsap.set(character, { zIndex: 20, opacity: 1 });
// 				},
// 			});
// 		};

// 		const context = gsap.context(() => {
// 			gsap.set(group, { x: 0, y: 0, scale: 1, transformOrigin: 'top left' });
// 			gsap.set(character, { xPercent: 0, zIndex: 20 });

// 			// ✅ resize 时重算 compact state
// 			ScrollTrigger.addEventListener('refreshInit', calcCompactState);
// 			calcCompactState();

// 			ScrollTrigger.create({
// 				trigger: section,
// 				start: 'top top',
// 				end: `+=${PIN_SCROLL_DISTANCE}`,
// 				pin: true,
// 				anticipatePin: 1,
// 				onUpdate: (self) => {
// 					const isPushing = self.direction >= 0;
// 					const compact = compactStateRef.current;
// 					if (!compact) return;

// 					if (isPushing) {
// 						pullTweenRef.current?.kill();
// 						isPullPlayingRef.current = false;
// 						hasPlayedPullForGestureRef.current = false;
// 						gsap.set(character, { zIndex: 20, opacity: 1 });

// 						// ✅ group 整体动，video 本身只负责内部 scale 视觉（由 group scale 代劳）
// 						gsap.to(group, {
// 							x: compact.x * self.progress,
// 							y: compact.y * self.progress,
// 							// ✅ progress=1 时刚好到达 compact scale，之后不再变化
// 							scale: 1 + (compact.scale - 1) * self.progress,
// 							duration: 0.16,
// 							ease: 'power1.out',
// 							overwrite: 'auto',
// 						});
// 						gsap.to('.intro-copy', {
// 							y: -70 * self.progress,
// 							opacity: 1 - 0.75 * self.progress,
// 							duration: 0.16,
// 							ease: 'power1.out',
// 						});

// 						setPushFrame(self.progress, self.getVelocity());
// 						return;
// 					}

// 					// 向上滚动：还原
// 					gsap.to(group, {
// 						x: 0,
// 						y: 0,
// 						scale: 1,
// 						duration: 0.28,
// 						ease: 'power3.out',
// 						overwrite: 'auto',
// 					});
// 					gsap.to('.intro-copy', {
// 						y: 0,
// 						opacity: 1,
// 						duration: 0.28,
// 						ease: 'power3.out',
// 					});
// 					playPullOnce();
// 				},
// 			});
// 		}, stage);

// 		return () => {
// 			pullTweenRef.current?.kill();
// 			ScrollTrigger.removeEventListener('refreshInit', calcCompactState);
// 			context.revert();
// 		};
// 	}, []);

// 	return (
// 		<section
// 			ref={sectionRef}
// 			id='projects'
// 			className='relative flex min-h-svh w-full items-center overflow-hidden px-5 md:px-8'
// 		>
// 			<div ref={stageRef} className='relative mx-auto h-[min(760px,82svh)] w-full max-w-360'>
// 				{/*
//           ✅ group wrapper：character 左，video 右，两者自然贴合
//           用 inline-flex 让 group 宽度 = character宽 + video宽
//           absolute 定位放在 stage 内，水平居中偏右
//         */}
// 				<div
// 					ref={groupRef}
// 					className='absolute top-0 left-[8%] z-10 flex items-end md:left-[12%] xl:left-[20%]'
// 					style={{ transformOrigin: 'top left' }}
// 				>
// 					<img
// 						ref={characterRef}
// 						src={getFramePath(characterFolder, frame)}
// 						alt='Sage character pushing the video'
// 						className='pointer-events-none relative z-20 h-auto w-[clamp(120px,20vw,280px)] self-end select-none'
// 						draggable={false}
// 					/>
// 					<div
// 						ref={videoRef}
// 						className='bg-darkink relative z-10 aspect-video w-[min(65vw,760px)] overflow-hidden rounded-lg border shadow-[0_30px_90px_rgba(47,47,47,0.28)]'
// 					>
// 						<video
// 							autoPlay
// 							muted
// 							loop
// 							playsInline
// 							src='https://stream.mux.com/xNEVeKx007rd6D3rNgrsN014Fx6st6WGlC4pz01O6ssnxI.m3u8'
// 							className='absolute inset-0 h-full w-full object-cover'
// 						/>
// 						<div className='absolute inset-0 grid place-items-center'>
// 							<button
// 								type='button'
// 								aria-label='Play intro video'
// 								className='text-darkink grid h-16 w-16 place-items-center rounded-full bg-white/92 shadow-[0_12px_36px_rgba(0,0,0,0.22)] transition-transform hover:scale-105'
// 							>
// 								<span className='border-l-darkink ml-1 h-0 w-0 border-y-10 border-l-16 border-y-transparent' />
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		</section>
// 	);
// };

// 第三版
// import { useLayoutEffect, useMemo, useRef, useState } from 'react';
// import gsap from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// gsap.registerPlugin(ScrollTrigger);

// const SAGE_FRAME_COUNTS = {
// 	sage_pull: 25,
// 	sage_push: 174,
// } as const;

// type SageFolder = keyof typeof SAGE_FRAME_COUNTS;

// const PIN_SCROLL_DISTANCE = 300;
// const COMPACT_VIDEO_WIDTH_VW = 22;
// const COMPACT_PADDING_TOP = 24;
// const COMPACT_PADDING_RIGHT = 28;

// const getFramePath = (folder: SageFolder, index: number) =>
// 	`/assets/${folder}/${String(index).padStart(3, '0')}.png`;

// export const RibbitIntroScroll = () => {
// 	const sectionRef = useRef<HTMLElement | null>(null);
// 	const stageRef = useRef<HTMLDivElement | null>(null);
// 	const groupRef = useRef<HTMLDivElement | null>(null);
// 	const videoRef = useRef<HTMLDivElement | null>(null);
// 	const characterRef = useRef<HTMLImageElement | null>(null);
// 	const frameCursorRef = useRef<Record<SageFolder, number>>({ sage_pull: 0, sage_push: 0 });
// 	const pullTweenRef = useRef<gsap.core.Tween | null>(null);
// 	const isPullPlayingRef = useRef(false);
// 	const hasPlayedPullForGestureRef = useRef(false);
// 	const compactStateRef = useRef<{
// 		group: { x: number; y: number; scale: number };
// 	} | null>(null);

// 	const [characterFolder, setCharacterFolder] = useState<SageFolder>('sage_push');
// 	const [frame, setFrame] = useState(0);

// 	const preloadFrames = useMemo(
// 		() =>
// 			(Object.keys(SAGE_FRAME_COUNTS) as SageFolder[]).flatMap((folder) =>
// 				Array.from({ length: SAGE_FRAME_COUNTS[folder] }, (_, index) => getFramePath(folder, index))
// 			),
// 		[]
// 	);

// 	useLayoutEffect(() => {
// 		preloadFrames.forEach((src) => {
// 			const image = new Image();
// 			image.src = src;
// 		});
// 	}, [preloadFrames]);

// 	useLayoutEffect(() => {
// 		const section = sectionRef.current;
// 		const stage = stageRef.current;
// 		const group = groupRef.current;
// 		const video = videoRef.current;
// 		const character = characterRef.current;

// 		if (!section || !stage || !group || !video || !character) return;

// 		const calcCompactState = () => {
// 			const stageW = stage.clientWidth;
// 			const compactVideoW = (COMPACT_VIDEO_WIDTH_VW / 100) * window.innerWidth;

// 			// group scale 由 video 的目标宽度决定
// 			// group 整体缩放后，video 部分的宽度 = video.offsetWidth * groupScale = compactVideoW
// 			const groupScale = compactVideoW / video.offsetWidth;

// 			// group 缩放后的视觉尺寸
// 			const scaledGroupW = group.offsetWidth * groupScale;
// 			// const scaledGroupH = group.offsetHeight * groupScale;

// 			// 目标：group 右边对齐 stageW - padding
// 			const groupTargetX = stageW - COMPACT_PADDING_RIGHT - scaledGroupW - group.offsetLeft;

// 			// 目标：video 顶部（= group 顶部，因为 items-end 时 video 比 character 高）
// 			// 实际 group 顶部 = video 顶部（video 是最高的元素）
// 			// 让缩放后的 group 顶部 = COMPACT_PADDING_TOP
// 			const groupTargetY = COMPACT_PADDING_TOP - group.offsetTop;

// 			compactStateRef.current = {
// 				group: { x: groupTargetX, y: groupTargetY, scale: groupScale },
// 			};
// 		};

// 		// const setPushFrame = (progress: number, velocity: number) => {
// 		// 	console.log('setPushFrame', progress, velocity);
// 		// 	const velocityStep = Math.max(1, Math.min(8, Math.abs(velocity) / 300));
// 		// 	frameCursorRef.current.sage_push += velocityStep;
// 		// 	setCharacterFolder('sage_push');
// 		// 	setFrame(
// 		// 		Math.floor(frameCursorRef.current.sage_push + progress * 18) % SAGE_FRAME_COUNTS.sage_push
// 		// 	);
// 		// };

// 		const setPushFrame = (progress: number, velocity: number) => {
// 			// 根据滚动速度计算每一步跳过的帧数（保持你的灵敏度逻辑）
// 			const velocityStep = Math.max(1, Math.min(8, Math.abs(velocity) / 300));

// 			// 累加当前光标位置
// 			const nextFrame = frameCursorRef.current.sage_push + velocityStep;

// 			// 限制最大帧数，不要取模循环，这样推到最后一帧（靠着动作）就会停住
// 			frameCursorRef.current.sage_push = Math.min(nextFrame, SAGE_FRAME_COUNTS.sage_push - 1);

// 			setCharacterFolder('sage_push');

// 			// setFrame 使用限制后的光标值
// 			setFrame(Math.floor(frameCursorRef.current.sage_push));
// 		};

// 		const playPullOnce = () => {
// 			if (isPullPlayingRef.current || hasPlayedPullForGestureRef.current) return;

// 			pullTweenRef.current?.kill();
// 			isPullPlayingRef.current = true;
// 			hasPlayedPullForGestureRef.current = true;
// 			setCharacterFolder('sage_pull');

// 			const frameState = { frame: 0 };
// 			pullTweenRef.current = gsap.to(frameState, {
// 				frame: SAGE_FRAME_COUNTS.sage_pull - 1,
// 				duration: 0.72,
// 				ease: 'steps(24)',
// 				onStart: () => {
// 					gsap.set(character, { zIndex: 5, opacity: 0.1, x: '+=26' });
// 					gsap.to(character, { opacity: 1, x: '-=26', duration: 0.22, ease: 'power2.out' });
// 				},
// 				onUpdate: () => setFrame(Math.round(frameState.frame)),
// 				onComplete: () => {
// 					isPullPlayingRef.current = false;
// 					gsap.set(character, { zIndex: 20, opacity: 1 });
// 				},
// 			});
// 		};

// 		const context = gsap.context(() => {
// 			// group 以 top-left 为原点缩放，这样右移计算最直觉
// 			gsap.set(group, { x: 0, y: 0, scale: 1, transformOrigin: 'top left' });
// 			// character 反向补偿以 bottom-right 为原点（贴着 video 的那个角）
// 			gsap.set(character, { scale: 1, transformOrigin: 'bottom right', zIndex: 20 });
// 			gsap.set(video, { clearProps: 'all' });

// 			ScrollTrigger.addEventListener('refreshInit', calcCompactState);
// 			calcCompactState();

// 			ScrollTrigger.create({
// 				trigger: section,
// 				start: 'top top',
// 				end: `+=${PIN_SCROLL_DISTANCE}`,
// 				pin: true,
// 				anticipatePin: 1,
// 				onUpdate: (self) => {
// 					const isPushing = self.direction >= 0;
// 					const compact = compactStateRef.current;
// 					if (!compact) return;

// 					if (isPushing) {
// 						pullTweenRef.current?.kill();
// 						isPullPlayingRef.current = false;
// 						hasPlayedPullForGestureRef.current = false;
// 						gsap.set(character, { zIndex: 20, opacity: 1 });

// 						const p = self.progress;
// 						const groupScale = 1 + (compact.group.scale - 1) * p;
// 						// character 反向补偿，视觉尺寸保持不变
// 						const charCounterScale = 1 / groupScale;

// 						gsap.to(group, {
// 							x: compact.group.x * p,
// 							y: compact.group.y * p,
// 							scale: groupScale,
// 							duration: 0.16,
// 							ease: 'power1.out',
// 							overwrite: 'auto',
// 						});

// 						gsap.to(character, {
// 							scale: charCounterScale,
// 							duration: 0.16,
// 							ease: 'power1.out',
// 							overwrite: 'auto',
// 						});

// 						// gsap.to('.intro-copy', {
// 						// 	y: -70 * p,
// 						// 	opacity: 1 - 0.75 * p,
// 						// 	duration: 0.16,
// 						// 	ease: 'power1.out',
// 						// });

// 						setPushFrame(p, self.getVelocity());
// 						return;
// 					}

// 					// 还原
// 					gsap.to(group, {
// 						x: 0,
// 						y: 0,
// 						scale: 1,
// 						duration: 0.28,
// 						ease: 'power3.out',
// 						overwrite: 'auto',
// 					});
// 					gsap.to(character, {
// 						scale: 1,
// 						duration: 0.28,
// 						ease: 'power3.out',
// 						overwrite: 'auto',
// 					});
// 					// gsap.to('.intro-copy', {
// 					// 	y: 0,
// 					// 	opacity: 1,
// 					// 	duration: 0.28,
// 					// 	ease: 'power3.out',
// 					// });
// 					frameCursorRef.current.sage_push = 15;
// 					playPullOnce();
// 				},
// 			});
// 		}, stage);

// 		return () => {
// 			pullTweenRef.current?.kill();
// 			ScrollTrigger.removeEventListener('refreshInit', calcCompactState);
// 			context.revert();
// 		};
// 	}, []);

// 	return (
// 		<section
// 			ref={sectionRef}
// 			id='projects'
// 			className='relative flex min-h-svh w-full items-center overflow-hidden px-5 md:px-8'
// 		>
// 			<div ref={stageRef} className='relative mx-auto h-[min(760px,82svh)] w-full max-w-360'>
// 				<div
// 					ref={groupRef}
// 					className='absolute top-0 right-0 flex items-end'
// 					style={{ transformOrigin: 'top left' }}
// 				>
// 					{/* character：bottom-right 为补偿原点，紧贴 video 左边缘 */}
// 					<img
// 						ref={characterRef}
// 						src={getFramePath(characterFolder, frame)}
// 						alt='Sage character pushing the video'
// 						className='pointer-events-none relative z-20 h-auto w-[clamp(120px,18vw,260px)] shrink-0 select-none'
// 						style={{ transformOrigin: 'bottom right' }}
// 						draggable={false}
// 					/>
// 					{/* video：随 group 缩放 */}
// 					<div
// 						ref={videoRef}
// 						className='bg-darkink relative z-10 aspect-video w-[min(58vw,700px)] shrink-0 overflow-hidden rounded-lg border shadow-[0_30px_90px_rgba(47,47,47,0.28)]'
// 					>
// 						<video
// 							autoPlay
// 							muted
// 							loop
// 							playsInline
// 							src='https://stream.mux.com/xNEVeKx007rd6D3rNgrsN014Fx6st6WGlC4pz01O6ssnxI.m3u8'
// 							className='absolute inset-0 h-full w-full object-cover'
// 						/>
// 						<div className='absolute inset-0 grid place-items-center'>
// 							<button
// 								type='button'
// 								aria-label='Play intro video'
// 								className='text-darkink grid h-16 w-16 place-items-center rounded-full bg-white/92 shadow-[0_12px_36px_rgba(0,0,0,0.22)] transition-transform hover:scale-105'
// 							>
// 								<span className='border-l-darkink ml-1 h-0 w-0 border-y-10 border-l-16 border-y-transparent' />
// 							</button>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		</section>
// 	);
// };

// 第四版
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
		<section
			ref={sectionRef}
			id='projects'
			className='relative flex min-h-svh w-full items-center overflow-hidden px-5 md:px-8'
		>
			<div ref={stageRef} className='relative mx-auto h-[min(760px,82svh)] w-full max-w-360'>
				<div
					ref={groupRef}
					className='absolute top-0 right-0 flex items-end'
					style={{ transformOrigin: 'top left' }}
				>
					<img
						ref={characterRef}
						src={getFramePath(characterFolder, frame)}
						alt='Sage character pushing the video'
						className='pointer-events-none relative z-20 h-auto w-[clamp(120px,18vw,260px)] shrink-0 select-none'
						style={{ transformOrigin: 'bottom right' }}
						draggable={false}
					/>
					<div
						ref={videoRef}
						className='bg-darkink relative z-10 aspect-video w-[min(58vw,700px)] shrink-0 overflow-hidden rounded-lg border shadow-[0_30px_90px_rgba(47,47,47,0.28)]'
					>
						<video
							autoPlay
							muted
							loop
							playsInline
							src='https://stream.mux.com/xNEVeKx007rd6D3rNgrsN014Fx6st6WGlC4pz01O6ssnxI.m3u8'
							className='absolute inset-0 h-full w-full object-cover'
						/>
						<div className='absolute inset-0 grid place-items-center'>
							<button
								type='button'
								aria-label='Play intro video'
								className='text-darkink grid h-16 w-16 place-items-center rounded-full bg-white/92 shadow-[0_12px_36px_rgba(0,0,0,0.22)] transition-transform hover:scale-105'
							>
								<span className='border-l-darkink ml-1 h-0 w-0 border-y-10 border-l-16 border-y-transparent' />
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
