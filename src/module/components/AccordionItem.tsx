import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { HiOutlinePlus } from 'react-icons/hi2';
import { cn } from 'src/utils/cn';

export const AccordionItem = ({
	title,
	description,
	icon,
	animatedIcon,
	isOpen,
	onClick,
}: {
	title: string;
	description: string;
	icon: string;
	animatedIcon: string;
	isOpen: boolean;
	onClick: () => void;
}) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const [isHovered, setIsHovered] = useState(false);
	const activeIcon = isHovered ? animatedIcon : icon;

	useEffect(() => {
		if (isOpen) {
			gsap.to(contentRef.current, {
				height: 'auto',
				duration: 0.5,
				ease: 'power2.out',
				opacity: 1,
			});
		} else {
			gsap.to(contentRef.current, {
				height: 0,
				duration: 0.5,
				ease: 'power2.inOut',
				opacity: 0,
			});
		}
	}, [isOpen]);

	return (
		<div className='border-darkink/10 border-b last:border-b-0'>
			<button
				onClick={onClick}
				className='group flex w-full cursor-pointer items-center justify-between py-3 text-left transition-colors'
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onFocus={() => setIsHovered(true)}
				onBlur={() => setIsHovered(false)}
			>
				<div className='flex items-center gap-2'>
					<div className='flex h-6 w-6 items-center justify-center transition-opacity'>
						<img src={activeIcon} alt='' className='h-full w-full object-contain' />
					</div>
					<span className='text-darkink text-xs font-medium md:text-sm'>{title}</span>
				</div>
				<div
					className={cn(
						'flex h-8 w-8 items-center justify-center transition-transform duration-500 hover:scale-105',
						isOpen && 'rotate-45'
					)}
				>
					<HiOutlinePlus size={16} />
				</div>
			</button>
			<div ref={contentRef} className='overflow-hidden' style={{ height: 0, opacity: 0 }}>
				<div className='pb-4 pl-8'>
					<p className='text-darkink/70 max-w-xl text-[10px] leading-relaxed md:text-xs'>
						{description}
					</p>
				</div>
			</div>
		</div>
	);
};
