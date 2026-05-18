import { forwardRef, useEffect, useRef, useState } from 'react';
import { cn } from 'src/utils/cn';

type ProjectType = {
	title: string;
	href: string;
	image: string;
	video: string;
};

const projects: ProjectType[] = [
	{
		title: 'Hi energy',
		href: '/projects/hi-energy',
		image:
			'https://images.prismic.io/ribbit/aNmIbZ5xUNkB1MRk_Hi_brandvideo_05.09.25_CAR-0-00-05-04-.png?auto=format,compress&rect=0,0,1920,1080&w=1600&h=900',
		video:
			'https://ribbit.cdn.prismic.io/ribbit/aNz3IJ5xUNkB1Vcu_Hi_Featured_trailer_Website_01.mp4',
	},
	{
		title: 'TOIOMI',
		href: '/projects/toiomi-ribbit',
		image:
			'https://images.prismic.io/ribbit/aNwz3p5xUNkB1TtH_Sk%C3%A6rmbillede2025-09-30kl.21.47.16.png?auto=format,compress&rect=80,0,2759,1552&w=1600&h=900',
		video:
			'https://ribbit.cdn.prismic.io/ribbit/aNzrb55xUNkB1U7J_Astrae_16_9_Feateured_trailer2.mp4',
	},
	{
		title: 'Birdie',
		href: '/projects/birdie',
		image:
			'https://images.prismic.io/ribbit/acEv05GXnQHGY2aq_MAIN_Birdie_16x9-0-00-04-00-.png?auto=format,compress&rect=0,0,1920,1080&w=1600&h=900',
		video:
			'https://ribbit.cdn.prismic.io/ribbit/acEuz5GXnQHGY2aZ_Birdie_16x9_website_project_teaser.mp4',
	},
];

export const FeaturedProject = () => {
	const [activeIndex, setActiveIndex] = useState(0);
	const projectsRef = useRef<(HTMLDivElement | null)[]>([]);
	const titleItemRef = useRef<HTMLHeadingElement | null>(null);
	const [titleItemHeight, setTitleItemHeight] = useState(48);

	useEffect(() => {
		const observers = projectsRef.current.map((el, i) => {
			if (!el) return null;
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							setActiveIndex(i);
						}
					});
				},
				{
					root: null,
					// Trigger when the card crosses the center 20% of the screen
					rootMargin: '-40% 0px -40% 0px',
					threshold: 0,
				}
			);
			observer.observe(el);
			return observer;
		});

		return () => {
			observers.forEach((obs) => obs?.disconnect());
		};
	}, []);

	useEffect(() => {
		if (titleItemRef.current) {
			setTitleItemHeight(titleItemRef.current.offsetHeight);
		}
	}, []);

	return (
		<section
			id='featured-projects'
			className='border-darkink/10 bg-darkink relative min-h-screen border-b text-white'
		>
			{/* Sticky Text Overlay - Spans full width, text at edges */}
			<div className='pointer-events-none absolute inset-0 z-20'>
				<div className='sticky top-0 flex h-screen w-full items-center justify-between px-6 mix-blend-difference md:px-12 lg:px-20'>
					{/* Left: Featured Project Label */}
					<div className='flex-1'>
						<p className='text-xs font-bold tracking-[0.28em] text-white uppercase md:text-sm'>
							Featured project
						</p>
					</div>

					{/* Center Spacer to push text to edges if needed */}
					<div className='hidden w-full max-w-sm shrink-0 md:block lg:max-w-2xl'></div>

					{/* Right: Project Title (Scrolling) */}
					<div className='flex flex-1 justify-end'>
						<div className='overflow-hidden' style={{ height: `${titleItemHeight}px` }}>
							<div
								className='flex flex-col text-right transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]'
								style={{ transform: `translateY(-${activeIndex * titleItemHeight}px)` }}
							>
								{projects.map((p, i) => (
									<h3
										key={i}
										ref={i === 0 ? titleItemRef : undefined}
										className='flex items-center justify-end text-xl font-bold tracking-wide whitespace-nowrap text-white uppercase lg:text-2xl'
										style={{ height: `${titleItemHeight}px` }}
									>
										{p.title}
									</h3>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Center: Scrolling Videos */}
			<div className='relative z-10 flex w-full flex-col items-center gap-[40vh] px-4 py-[35vh] md:gap-[50vh] md:py-[40vh]'>
				{projects.map((project, index) => (
					<ProjectCard
						key={index}
						project={project}
						isActive={activeIndex === index}
						ref={(el) => {
							projectsRef.current[index] = el;
						}}
					/>
				))}
			</div>

			{/* Bottom Button */}
			<div className='relative z-30 mt-10 flex justify-center pb-20'>
				<button
					type='button'
					className='hover:text-darkink inline-flex -skew-x-12 items-center justify-center rounded-md border border-white/60 p-3 text-xs font-medium text-white transition-all duration-300 hover:bg-white'
				>
					<span className='tracking-widest uppercase'>All Projects</span>
				</button>
			</div>
		</section>
	);
};

const ProjectCard = forwardRef<HTMLDivElement, { project: ProjectType; isActive: boolean }>(
	({ project, isActive }, ref) => {
		const videoRef = useRef<HTMLVideoElement>(null);

		useEffect(() => {
			if (isActive) {
				videoRef.current?.play().catch(() => {});
			} else {
				videoRef.current?.pause();
			}
		}, [isActive]);

		return (
			<div
				ref={ref}
				className={cn(
					'group pointer-events-auto relative aspect-video w-full max-w-2xl overflow-hidden rounded-lg shadow-2xl transition-all duration-700 ease-out',
					isActive ? 'scale-110 opacity-100 shadow-white/10' : 'scale-90 opacity-40 shadow-none'
				)}
			>
				<a href={project.href} className='absolute inset-0 z-10 block cursor-pointer' />

				{/* Poster Image */}
				<img
					src={project.image}
					alt={project.title}
					className={cn(
						'absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]',
						isActive ? 'scale-100 opacity-0' : 'scale-90 opacity-100'
					)}
				/>

				{/* Autoplaying Video when Active */}
				<video
					ref={videoRef}
					src={project.video}
					muted
					loop
					playsInline
					className={cn(
						'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
						isActive ? 'opacity-100' : 'opacity-0'
					)}
				/>
			</div>
		);
	}
);

ProjectCard.displayName = 'ProjectCard';
