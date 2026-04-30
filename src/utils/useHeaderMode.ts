import { useEffect, useState } from 'react';
import type { HeaderMode } from 'src/module/layouts/Header';

const TOP_THRESHOLD = 36;
const DESKTOP_BREAKPOINT = '(min-width: 1024px)';

export const useHeaderMode = () => {
	const [isDesktop, setIsDesktop] = useState(() => {
		return window.matchMedia(DESKTOP_BREAKPOINT).matches;
	});
	const [isAtTop, setIsAtTop] = useState(true);
	const [isNearFooter, setIsNearFooter] = useState(false);
	const [isUserOpen, setIsUserOpen] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT);
		const updateMedia = (event: MediaQueryListEvent) => setIsDesktop(event.matches);

		mediaQuery.addEventListener('change', updateMedia);
		return () => mediaQuery.removeEventListener('change', updateMedia);
	}, []);

	useEffect(() => {
		const onScroll = () => setIsAtTop(window.scrollY <= TOP_THRESHOLD && isDesktop);

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		const footer = document.getElementById('page-footer');
		if (!footer) {
			return;
		}

		const observer = new IntersectionObserver(([entry]) => setIsNearFooter(entry.isIntersecting), {
			threshold: 0.22,
			rootMargin: '0px 0px -12% 0px',
		});

		observer.observe(footer);
		return () => observer.disconnect();
	}, []);

	const isOpen = isNearFooter ? true : isAtTop ? false : isUserOpen;

	let mode: HeaderMode = 'compact';

	if (isAtTop) {
		mode = 'top';
	} else if (isNearFooter) {
		mode = 'footer';
	} else if (isOpen) {
		mode = 'expanded';
	}

	return {
		isDesktop,
		mode,
		isOpen,
		setIsOpen: setIsUserOpen,
	};
};
