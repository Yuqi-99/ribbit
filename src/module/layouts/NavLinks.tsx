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
	return (
		<nav className={cn('flex items-center justify-center gap-4 whitespace-nowrap', className)}>
			{HEADER_DATA.map((item) => {
				return (
					<a
						key={item.id}
						href={item.url}
						className={cn(
							'text-[10px] uppercase opacity-75 transition-all duration-300 hover:opacity-100',
							isFooterMode || mode == 'top' ? 'text-darkink' : 'text-white'
						)}
					>
						{item.title}
					</a>
				);
			})}
		</nav>
	);
};
