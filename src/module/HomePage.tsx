export const HomePage = () => {
	return (
		<div
			id='top'
			className='flex min-h-screen w-full max-w-360 flex-col overflow-visible px-5 pt-28 pb-16 md:px-8 md:pt-36 md:pb-24'
		>
			<section
				id='projects'
				className='border-darkink/10 flex min-h-screen flex-col justify-center border-b pb-20'
			>
				<p className='text-darkink/50 mb-4 text-xs tracking-[0.28em] uppercase'>Projects</p>
				<h1 className='text-darkink max-w-4xl text-5xl leading-none font-medium md:text-8xl'>
					Ribbit style header prototype
				</h1>
				<p className='text-darkink/70 mt-6 max-w-xl text-base leading-7'>
					Scroll this page to test the header transitions: top logo + navigation, compact eye while
					reading, and split eyes around navigation near the footer.
				</p>
			</section>

			<section
				id='about'
				className='border-darkink/10 grid min-h-[90svh] gap-8 border-b py-20 md:grid-cols-2'
			>
				<div>
					<p className='text-darkink/50 mb-4 text-xs tracking-[0.28em] uppercase'>About</p>
					<h2 className='text-darkink text-3xl font-medium md:text-5xl'>
						The trick is not one header.
					</h2>
				</div>
				<p className='text-darkink/70 max-w-xl text-base leading-7'>
					It behaves more like a small state machine. You switch layout by scroll position, viewport
					size, and hover state, while keeping the header fixed and decoupled from page content.
				</p>
			</section>

			<section
				id='process'
				className='border-darkink/10 grid min-h-[90svh] gap-8 border-b py-20 md:grid-cols-2'
			>
				<div>
					<p className='text-darkink/50 mb-4 text-xs tracking-[0.28em] uppercase'>Process</p>
					<h2 className='text-darkink text-3xl font-medium md:text-5xl'>
						Scroll decides structure.
					</h2>
				</div>
				<p className='text-darkink/70 max-w-xl text-base leading-7'>
					Top of page shows the brand and navigation together. Once the hero is gone, the navigation
					collapses into a single animated eye. When the footer intersects, the eye splits so the
					links can sit in the middle.
				</p>
			</section>

			<footer id='page-footer' className='flex min-h-[65svh] flex-col justify-end gap-6 py-20'>
				<div id='contact' className='border-darkink/10 border-t pt-8'>
					<p className='text-darkink/50 mb-4 text-xs tracking-[0.28em] uppercase'>Contact</p>
					<h2 className='text-darkink max-w-2xl text-3xl font-medium md:text-5xl'>
						This footer is your trigger zone for the split-eye state.
					</h2>
					<p className='text-darkink/70 mt-6 max-w-xl text-base leading-7'>
						If you later want it to match the original site more closely, we can replace the scroll
						threshold logic with GSAP ScrollTrigger timelines and drive the header morph
						continuously instead of switching state by state.
					</p>
				</div>
			</footer>
		</div>
	);
};
