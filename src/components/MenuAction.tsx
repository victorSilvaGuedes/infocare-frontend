import { cn } from '@/lib/utils'
import { Card } from './ui/card'

interface MenuActionProps {
	onClick: () => void
	icon: React.ElementType
	label: string
	description: string
	isDestructive: boolean
}

export function MenuAction({
	onClick,
	icon: Icon,
	label,
	description,
	isDestructive,
}: MenuActionProps) {
	return (
		<button
			onClick={onClick}
			className="w-full text-left"
		>
			<Card className="flex flex-row items-center gap-4 p-4 transition-colors hover:bg-muted/50 hover:cursor-pointer">
				{/* Cor do ícone condicional */}
				<Icon
					className={cn(
						'h-7 w-7',
						isDestructive ? 'text-destructive' : 'text-primary'
					)}
				/>
				<div>
					<p className="text-base font-semibold">{label}</p>
					<p className="text-xs text-muted-foreground">{description}</p>
				</div>
			</Card>
		</button>
	)
}
