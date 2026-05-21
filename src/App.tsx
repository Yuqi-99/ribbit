import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
	RouterProvider,
} from 'react-router-dom';
import 'src/App.css';
import { NotFoundPage } from 'src/module/NotFoundPage';
import { RootLayout } from 'src/module/layouts/RootLayout';
import { HomePage } from 'src/module/HomePage';

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route errorElement={<NotFoundPage />}>
			<Route path='/' element={<RootLayout />}>
				<Route path='/' element={<HomePage />} />
				<Route path='*' element={<NotFoundPage />} />
			</Route>
		</Route>
	),
	{
		// future: { v7_normalizeFormMethod: true },
	}
);

export const App = () => {
	return (
		<>
			<RouterProvider router={router} />
		</>
	);
};
