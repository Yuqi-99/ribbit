import { FaqSection } from 'src/module/FaqSection';
import { FeaturedProject } from 'src/module/FeaturedProject';
import { RibbitDesc } from 'src/module/RibbitDesc';
import { RibbitIntroScroll } from 'src/module/RibbitIntroScroll';

export const HomePage = () => {
	return (
		<div
			id='top'
			className='flex min-h-screen w-full max-w-360 flex-col overflow-visible'
		>
			<RibbitIntroScroll />

			<RibbitDesc />

			<FeaturedProject />

			<FaqSection />
		</div>
	);
};
