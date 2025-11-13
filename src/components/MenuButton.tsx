import Link from 'next/link'
import { Card } from './ui/card'

interface MenuButtonProps {
	href: string
	icon: React.ElementType
	label: string
	description: string
}

export function MenuButton({
	href,
	icon: Icon,
	label,
	description,
}: MenuButtonProps) {
	return (
		<Link
			href={href}
			passHref
		>
			<Card className="flex flex-row items-center gap-4 p-4 transition-colors hover:bg-muted/50">
				<Icon className="h-7 w-7 text-primary" />
				<div>
					<p className="text-base font-semibold">{label}</p>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
			</Card>
		</Link>
	)
}
