import type { EyeTone } from 'src/module/layouts/Header';
import eyeDark from 'src/assets/eye_dark.svg';
import eyeWhite from 'src/assets/eye_white.svg';
import { clamp } from 'src/utils/clamp';
import { cn } from 'src/utils/cn';

export const EyeIcon = ({
	offsetX,
	offsetY,
	tone = 'dark',
	className,
	blinking,
}: {
	offsetX: number;
	offsetY: number;
	tone?: EyeTone;
	className?: string;
	blinking?: boolean;
}) => {
	const src = tone === 'white' ? eyeWhite : eyeDark;
	const rotate = clamp(offsetX * 2.2, -8, 8);
	const translateX = clamp(offsetX * 0.8, -6, 6);
	const translateY = clamp(offsetY * 0.8, -4, 4);

	return (
		<div
			className={cn('flex h-10 w-10 scale-75 items-center justify-center rounded-full', className)}
		>
			<img
				src={src}
				alt=''
				aria-hidden='true'
				className={cn(
					'h-8 w-auto transition-transform duration-200 ease-out select-none',
					blinking && 'eye-blink'
				)}
				style={{
					transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg)`,
				}}
			/>
		</div>
	);
};
