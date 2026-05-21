import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from 'src/module/layouts/Header';
import { useSmoothScroll } from 'src/hooks/useSmoothScroll';
import { Footer } from 'src/module/layouts/Footer';
import { LoadingScreen } from 'src/module/components/LoadingScreen';

export const RootLayout = () => {
	const [isLoadingComplete, setIsLoadingComplete] = useState(false);

	// 0.09 = nice inertia feel; raise toward 0.15 for snappier, lower toward 0.07 for more float
	useSmoothScroll(0.12);

	return (
		<>
			{!isLoadingComplete && <LoadingScreen onComplete={() => setIsLoadingComplete(true)} />}
			<main className='bg-lightgrey text-darkink'>
				<div className='relative mx-auto flex min-h-screen w-full max-w-360 flex-col justify-start items-stretch'>
					<Header />
					<Outlet context={{ isLoadingComplete }} />
					<Footer />
				</div>
			</main>
		</>
	);
};
