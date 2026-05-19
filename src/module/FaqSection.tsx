import { useEffect, useState } from 'react';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import { AccordionItem } from 'src/module/components/AccordionItem';
import { cn } from 'src/utils/cn';

const services = [
	{
		title: 'Explainer videos',
		description:
			'Simplifying the complex with animated stories that stick. Perfect for making "Aha!" moments happen.',
		icon: '/assets/faq/explainer-video.png',
		animatedIcon: '/assets/faq/explainer-video.gif',
	},
	{
		title: 'Animated identities',
		description:
			'Bring your brand to life with dynamic logos and visuals that move with personality.',
		icon: '/assets/faq/animated-identities.png',
		animatedIcon: '/assets/faq/animated-identities.gif',
	},
	{
		title: 'Title sequences',
		description: 'Start strong! Eye-catching intros that set the tone for your content.',
		icon: '/assets/faq/title-sequence.png',
		animatedIcon: '/assets/faq/title-sequence.gif',
	},
	{
		title: 'Advertisements',
		description: 'Captivating motion ads that turn heads and drive action, all in style.',
		icon: '/assets/faq/advertisements.png',
		animatedIcon: '/assets/faq/advertisements.gif',
	},
	{
		title: 'SoMe content',
		description: 'Scroll-stopping motion content made to wow your social media followers.',
		icon: '/assets/faq/some-content.png',
		animatedIcon: '/assets/faq/some-content.gif',
	},
	{
		title: 'Scalable motion systems',
		description:
			'Flexible animations that grow with you, ensuring consistency across every platform.',
		icon: '/assets/faq/scalable-motion.png',
		animatedIcon: '/assets/faq/scalable-motion.gif',
	},
];

export const FaqSection = () => {
	const [openIndex, setOpenIndex] = useState(-1);
	const [hover, setHover] = useState(false);

	useEffect(() => {
		services.forEach(({ animatedIcon }) => {
			const image = new Image();
			image.src = animatedIcon;
		});
	}, []);

	return (
		<section className='bg-white px-5 py-20 md:px-8 lg:py-32'>
			<div className='mx-auto w-full max-w-360'>
				<div className='flex w-full flex-col gap-16 lg:flex-row lg:gap-32'>
					<div className='mb-12 flex w-full flex-col md:mb-16'>
						<div className='text-darkink mb-8 w-full text-start text-4xl font-medium tracking-tight md:text-6xl lg:text-7xl'>
							<p className='scale-y-150'>From Idea to Done.</p>
						</div>
						<div className='flex w-full flex-col lg:flex-row'>
							<div className='l flex-1'>
								<div className='mb-12 md:mb-16'>
									<p className='text-darkink/70 max-w-xl text-sm leading-relaxed'>
										We take care of the entire process from idea to finished result with everything
										that entails from art direction, copywriting, storyboard, music and sound
										effects.
									</p>
								</div>
								<div className='accordion'>
									<h5 className='text-darkink/80 mb-6 text-sm font-semibold tracking-wider uppercase'>
										Our Services:
									</h5>
									<div className='flex flex-col'>
										{services.map((service, index) => (
											<AccordionItem
												key={index}
												{...service}
												isOpen={openIndex === index}
												onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
											/>
										))}
									</div>
								</div>
							</div>
							<div className='r mt-8 flex flex-1 justify-center lg:mt-0'>
								<div className='book relative max-w-md'>
									<button
										type='button'
										className={cn(
											'text-darkink group absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -skew-x-12 items-center rounded-md bg-white px-6 py-3 transition-[transform,gap] duration-300 hover:scale-105 active:scale-95',
											hover ? 'gap-3' : 'gap-0'
										)}
										onMouseEnter={() => setHover(true)}
										onMouseLeave={() => setHover(false)}
									>
										<span className='text-sm font-medium uppercase'>See Process</span>
										<div
											className={cn(
												'flex h-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20 transition-[width,opacity,transform] duration-300 ease-out',
												hover
													? 'w-5 translate-x-0 scale-100 opacity-100'
													: 'w-0 -translate-x-2 scale-75 opacity-0'
											)}
										>
											<HiOutlineArrowRight size={12} className='text-darkink' />
										</div>
									</button>
									<div className='overflow-hidden rounded-3xl shadow-2xl transition-transform'>
										<img
											src='/assets/process_book.png'
											alt='Process Book'
											className='h-fit w-full object-cover'
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
