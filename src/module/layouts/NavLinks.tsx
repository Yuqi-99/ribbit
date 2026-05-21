import { useLocation } from 'react-router-dom';
import { HEADER_DATA } from 'src/constants/headerData';
import type { HeaderMode } from 'src/module/layouts/Header';
import { cn } from 'src/utils/cn';

export const NavLinks = ({
	className,
	isFooterMode = false,
	mode,
}: {
	className?: string;
	isFooterMode?: boolean;
	mode?: HeaderMode;
}) => {
	const { pathname } = useLocation();
	const isDarkPage = pathname !== '/';

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
		if (url.startsWith('#') && pathname === '/') {
			e.preventDefault();
			const id = url.substring(1);
			const element = document.getElementById(id);
			if (element) {
				const rect = element.getBoundingClientRect();
				const targetY = rect.top + window.scrollY;
				
				window.dispatchEvent(
					new CustomEvent('smoothScrollTo', { detail: { y: targetY } })
				);
			}
		}
	};

	return (
		<nav
			className={cn(
				'flex cursor-pointer items-center justify-center gap-4 whitespace-nowrap',
				className
			)}
		>
			{HEADER_DATA.map((item) => {
				return (
					<a
						key={item.id}
						href={item.url === '/' ? '/' : `/${item.url}`}
						onClick={(e) => handleClick(e, item.url)}
						className={cn(
							'text-[10px] uppercase opacity-75 transition-all duration-300 hover:opacity-100',
							(isFooterMode || mode == 'top') && !isDarkPage ? 'text-darkink' : 'text-white'
						)}
					>
						{item.title}
					</a>
				);
			})}
		</nav>
	);
};
