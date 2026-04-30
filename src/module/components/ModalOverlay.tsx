import { useEffect, useRef } from 'react';
import { cn } from 'src/utils/cn';
type TModalOverlayProps = {
	opened?: boolean;
	blur?: boolean;
	onClose: () => void;
};

export const ModalOverlay = ({ opened, blur, onClose }: TModalOverlayProps) => {
	const ref = useRef<HTMLDivElement | null>(null);

	// disable modal overlay scroll contexts when modal is open
	useEffect(() => {
		if (!opened || !ref.current) return () => {};
		const overlay = ref.current;

		const preventDefault = (e: Event) => {
			e.preventDefault();
			e.stopImmediatePropagation();
			e.stopPropagation();
		};

		overlay.addEventListener('wheel', preventDefault, { passive: false });
		overlay.addEventListener('touchmove', preventDefault, { passive: false });

		return () => {
			overlay.removeEventListener('wheel', preventDefault);
			overlay.removeEventListener('touchmove', preventDefault);
		};
	}, [opened]);

	return (
		<div
			ref={ref}
			className={cn(
				'z-modal-overlay fixed top-0 left-1/2 h-dvh w-screen max-w-[inherit] min-w-[inherit] -translate-x-1/2',
				blur ? 'backdrop-blur-sm' : 'bg-black/20'
			)}
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === 'Escape') {
					onClose();
				}
			}}
		/>
	);
};
