import { Outlet } from 'react-router-dom';
import { Header } from 'src/module/layouts/Header';
import { useSmoothScroll } from 'src/hooks/useSmoothScroll';

export const RootLayout = () => {
	// 0.09 = nice inertia feel; raise toward 0.15 for snappier, lower toward 0.07 for more float
	useSmoothScroll(0.12);

	return (
		<main className='bg-lightgrey text-darkink'>
			<div className='relative mx-auto flex min-h-screen w-full max-w-360 items-center justify-center'>
				<Header />
				<Outlet />
			</div>
		</main>
	);
};
