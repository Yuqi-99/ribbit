import { Link } from 'react-router-dom';
import { useState } from 'react';
import { cn } from 'src/utils/cn';

export const NotFoundPage = () => {
	const [isGoHovered, setIsGoHovered] = useState(false);

	return (
		<div className='relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#2F2F2F] text-[#FAFAFA] select-none'>
			{/* Large Outer White Circle (using exact original calculated margins and sizes) */}
			<div className='pointer-events-none absolute left-1/2 z-0 mt-[calc(-550px+55vh)] h-[80%] w-full -translate-x-1/2 rotate-[-10deg] rounded-[50%] bg-white md:top-0 md:h-[90vh] md:min-h-275 md:w-180 md:rotate-[-30deg] lg:-mr-115 lg:h-[110vh] lg:w-230' />

			{/* Centered Content Container */}
			<div className='relative z-10 m-auto flex h-80 w-150 max-w-full flex-col items-center justify-start px-4 pt-12.5 text-[#2F2F2F]'>
				{/* Inner Yellow Ellipse */}
				<div className='absolute top-4 left-1/2 -z-10 h-50 w-90 max-w-[95vw] -translate-x-1/2 rounded-[50%] bg-[#FFD948] md:top-0 md:h-80 md:w-170' />

				{/* 404 Error Heading (using matching serif family and skew filters to clone condensed serif) */}
				<h1 className='m-0 origin-center scale-x-85 scale-y-110 text-center font-serif text-4xl leading-[0.88] font-normal tracking-tighter select-none md:text-[clamp(4.5rem,14vw,8.5rem)]'>
					404 Error
				</h1>

				{/* Description text */}
				<p className='mt-7 mb-0 text-center font-sans text-xs leading-[0.8] font-medium tracking-tighter uppercase opacity-90 md:text-[clamp(1rem,3.5vw,1.1rem)]'>
					Oops! There's nothing here
				</p>

				{/* Go to frontpage Skewed Purple Button */}
				<Link
					to='/'
					className={cn(
						'relative mt-4 inline-flex cursor-pointer items-center gap-2 py-3 text-[11px] font-extrabold tracking-widest text-[#FAFAFA] uppercase transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] select-none md:mt-8 md:px-6 md:py-3.75',
						isGoHovered ? 'pr-12 pl-6' : 'pr-6 pl-6'
					)}
					onMouseEnter={() => setIsGoHovered(true)}
					onMouseLeave={() => setIsGoHovered(false)}
				>
					{/* Skewed Purple Background */}
					<span
						className={cn(
							'absolute inset-0 -z-10 rounded-md bg-[#A88BFA] transition-transform duration-300 ease-out',
							'skew-x-[-14deg]'
						)}
					/>

					<span>Go to frontpage</span>

					{/* Arrow Icon sliding in on hover */}
					<span
						className={cn(
							'pointer-events-none absolute right-5 flex h-3 w-4 items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]',
							isGoHovered ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
						)}
					>
						<svg
							width='14'
							height='10'
							viewBox='0 0 14 10'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M9 1L13 5M13 5L9 9M13 5H1'
								stroke='#FAFAFA'
								strokeWidth='2'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</span>
				</Link>
			</div>
		</div>
	);
};
