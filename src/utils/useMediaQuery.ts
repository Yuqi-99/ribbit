import { useState, useEffect } from 'react';

export const useMediaQuery = (query: string) => {
	const [matches, setMatches] = useState(() => {
		if (typeof window !== 'undefined') {
			return window.matchMedia(query).matches;
		}
		return false;
	});

	useEffect(() => {
		const media = window.matchMedia(query);
		const listener = () => setMatches(media.matches);
		media.addEventListener('change', listener);
		media.addEventListener('resize', listener);
		return () => {
			media.removeEventListener('change', listener);
			window.removeEventListener('resize', listener);
		};
	}, [query]);

	return matches;
};
