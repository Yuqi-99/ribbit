import { RibbitIntroScroll } from 'src/module/RibbitIntroScroll';

export const HomePage = () => {
	return (
		<div
			id='top'
			className='flex min-h-screen w-full max-w-360 flex-col overflow-visible pb-16 md:pb-24'
		>
			<RibbitIntroScroll />

			<section id='about' className='grid min-h-[90svh] gap-8 px-5 py-20 md:grid-cols-2 md:px-8'>
				<div>
					<p className='text-darkink/50 mb-4 text-xs tracking-[0.28em] uppercase'>About</p>
					<h2 className='text-darkink text-3xl font-medium md:text-5xl'>
						The trick is a pinned scroll scene.
					</h2>
				</div>
				<p className='text-darkink/70 max-w-xl text-base leading-7'>
					ScrollTrigger pins the hero while a scrubbed timeline moves the video. The same
					ScrollTrigger update tells us whether the user is scrolling down or up, so the character
					can swap between push and pull frame sequences.
				</p>
			</section>

			<section
				id='process'
				className='border-darkink/10 grid min-h-[90svh] gap-8 border-b px-5 py-20 md:grid-cols-2 md:px-8'
			>
				<div>
					<p className='text-darkink/50 mb-4 text-xs tracking-[0.28em] uppercase'>Process</p>
					<h2 className='text-darkink text-3xl font-medium md:text-5xl'>
						Direction decides performance.
					</h2>
				</div>
				<p className='text-darkink/70 max-w-xl text-base leading-7'>
					The visual contact is the important part: keep the character and video in the same
					timeline, then tune their starting positions until the hands feel attached to the edge of
					the video.
				</p>
			</section>

			<footer
				id='page-footer'
				className='flex min-h-[65svh] flex-col justify-end gap-6 px-5 py-20 md:px-8'
			>
				<div id='contact' className='border-darkink/10 border-t pt-8'>
					<p className='text-darkink/50 mb-4 text-xs tracking-[0.28em] uppercase'>Contact</p>
					<h2 className='text-darkink max-w-2xl text-3xl font-medium md:text-5xl'>
						Replace the panel with your real video.
					</h2>
					<p className='text-darkink/70 mt-6 max-w-xl text-base leading-7'>
						Once you add an mp4 or webm asset, put a video element inside the moving panel. The
						scroll animation can stay exactly where it is.
					</p>
				</div>
			</footer>
		</div>
	);
};
