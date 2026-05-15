import { FeaturedProject } from 'src/module/FeaturedProject';
import { RibbitDesc } from 'src/module/RibbitDesc';
import { RibbitIntroScroll } from 'src/module/RibbitIntroScroll';

export const HomePage = () => {
	return (
		<div
			id='top'
			className='flex min-h-screen w-full max-w-360 flex-col overflow-visible pb-16 md:pb-24'
		>
			<RibbitIntroScroll />

			<RibbitDesc />

			<FeaturedProject />

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
