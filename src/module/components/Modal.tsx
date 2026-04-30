import React, { useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { gsap } from 'gsap';
import { cn } from 'src/utils/cn';
import { ModalOverlay } from 'src/module/components/ModalOverlay';

type TModal = {
	opened: boolean;
	children: React.ReactNode;
	className?: string;
	blur?: boolean;
	onClose: () => void;
};

export const Modal = ({ children, opened, className, blur = false, onClose }: TModal) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const modalRef = useRef<HTMLDivElement>(null);
	const closeIconRef = useRef<HTMLDivElement>(null);
	const isClosingRef = useRef(false);

	// 入场动画
	useEffect(() => {
		if (opened) {
			isClosingRef.current = false;
			gsap.fromTo(
				modalRef.current,
				{ opacity: 0, scale: 0.5 },
				{ opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
			);
			gsap.fromTo(closeIconRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.1 });
		}
	}, [opened]);

	const handleClose = () => {
		if (isClosingRef.current) return;
		isClosingRef.current = true;

		const tl = gsap.timeline({
			onComplete: onClose,
		});

		tl.to(closeIconRef.current, { opacity: 0, duration: 0.2 }).to(
			modalRef.current,
			{
				opacity: 0,
				scale: 0.5,
				duration: 0.3,
				ease: 'power2.in',
			},
			'<'
		);
	};

	if (!opened) return null;

	return (
		<div
			ref={containerRef}
			className='z-modal fixed inset-0 flex h-full w-full items-center justify-center'
		>
			{/* 遮罩层 */}
			<ModalOverlay opened={opened} onClose={handleClose} blur={blur} />

			{/* 内容容器 */}
			<div className='z-modal-content relative flex h-auto w-screen flex-col items-center justify-center'>
				{/* 关闭按钮 */}
				<div ref={closeIconRef} className='z-modal-content fixed top-10 right-6 lg:right-24'>
					<div
						className='bg-lightgrey flex w-10 -skew-x-12 cursor-pointer items-center justify-center rounded-sm p-1 transition-transform hover:scale-110'
						onClick={handleClose}
					>
						{/* 内部图标反向倾斜，抵消父级的 skew，使其看起来是正的 */}
						<IoClose className='text-darkink size-6 skew-x-10 lg:size-8' />
					</div>
				</div>

				{/* Modal 主体 */}
				<div
					ref={modalRef}
					className={cn(
						'relative flex h-screen w-screen flex-col items-center justify-center bg-neutral-600 text-slate-900 shadow-2xl lg:w-210',
						className
					)}
				>
					<div className='flex w-full flex-col overflow-y-auto p-4'>{children}</div>
				</div>
			</div>
		</div>
	);
};
