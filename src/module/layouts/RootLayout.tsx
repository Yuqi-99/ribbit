import { Outlet } from 'react-router-dom';
import { Header } from 'src/module/layouts/Header';

export const RootLayout = () => {
	return (
		<main className='bg-lightgrey text-darkink'>
			<div className='relative mx-auto flex min-h-screen w-full max-w-360 items-center justify-center'>
				<Header />
				<Outlet />
			</div>
		</main>
	);
};
