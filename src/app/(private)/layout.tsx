'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLoader } from '@/components/AppLoader'
import { useAuthReady } from '@/app/hooks/useAuthReady'

export default function PrivateLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const router = useRouter()
	const { ready, logged } = useAuthReady()

	useEffect(() => {
		if (ready && !logged) {
			router.replace('/login')
		}
	}, [ready, logged, router])

	if (!ready || !logged) {
		return <AppLoader />
	}

	return <>{children}</>
}
