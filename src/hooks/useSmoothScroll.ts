import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Lightweight smooth scroll: intercepts wheel events and applies a
 * lerp (linear interpolation) each RAF frame so the page glides
 * rather than jumping.  After each frame we call ScrollTrigger.update()
 * so every scrub animation stays perfectly in sync.
 *
 * @param lerpFactor  0–1.  Lower = more inertia / silkier.  0.08–0.12 is ideal.
 */
export const useSmoothScroll = (lerpFactor = 0.1) => {
	useEffect(() => {
		let targetY = window.scrollY;
		let currentY = window.scrollY;
		let raf: number | null = null;

		const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
		const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

		const onWheel = (e: WheelEvent) => {
			e.preventDefault();

			// Normalise delta across DOM_DELTA_PIXEL / LINE / PAGE modes
			let delta = e.deltaY;
			if (e.deltaMode === 1) delta *= 40;
			if (e.deltaMode === 2) delta *= window.innerHeight;

			targetY = Math.max(0, Math.min(targetY + delta, maxScroll()));

			if (raf === null) raf = requestAnimationFrame(tick);
		};

		const onSmoothScrollTo = (e: Event) => {
			const customEvent = e as CustomEvent<{ y: number }>;
			targetY = Math.max(0, Math.min(customEvent.detail.y, maxScroll()));
			currentY = window.scrollY; // start from current position

			if (raf === null) {
				raf = requestAnimationFrame(tick);
			}
		};

		const tick = () => {
			currentY = lerp(currentY, targetY, lerpFactor);

			if (Math.abs(targetY - currentY) < 0.5) {
				currentY = targetY;
				window.scrollTo(0, currentY);
				ScrollTrigger.update();
				raf = null;
				return;
			}

			window.scrollTo(0, currentY);
			ScrollTrigger.update();
			raf = requestAnimationFrame(tick);
		};

		window.addEventListener('wheel', onWheel, { passive: false });
		window.addEventListener('smoothScrollTo', onSmoothScrollTo);

		return () => {
			window.removeEventListener('wheel', onWheel);
			window.removeEventListener('smoothScrollTo', onSmoothScrollTo);
			if (raf !== null) {
				cancelAnimationFrame(raf);
				raf = null;
			}
		};
	}, [lerpFactor]);
};
