import { Outlet } from 'react-router-dom';

export const RootLayout = () => {
	return (
		<main>
			<div className='relative mx-auto flex h-full w-full max-w-360 justify-center'>
				<Outlet />
			</div>
		</main>
	);
};
