import { PinClient } from './PinClient'

export const dynamic = 'force-dynamic'

export default function PinPage({ searchParams }: { searchParams: { next?: string } }) {
  const next = searchParams.next?.startsWith('/news') ? searchParams.next : '/news/hoy'
  return <PinClient next={next} />
}
