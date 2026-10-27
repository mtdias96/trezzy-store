import type { OrderStatusToken } from '@/styles/tokens';

const statusStyle = {
  pending: { label: 'Pendente', badge: 'bg-status-pending-bg text-status-pending-fg', dot: 'bg-status-pending-dot' },
  paid: { label: 'Pago', badge: 'bg-status-paid-bg text-status-paid-fg', dot: 'bg-status-paid-dot' },
  shipped: { label: 'Enviado', badge: 'bg-status-shipped-bg text-status-shipped-fg', dot: 'bg-status-shipped-dot' },
  delivered: {
    label: 'Entregue',
    badge: 'bg-status-delivered-bg text-status-delivered-fg',
    dot: 'bg-status-delivered-dot',
  },
  cancelled: {
    label: 'Cancelado',
    badge: 'bg-status-cancelled-bg text-status-cancelled-fg',
    dot: 'bg-status-cancelled-dot',
  },
} satisfies Record<OrderStatusToken, { label: string; badge: string; dot: string }>;

export function OrderStatusBadge({ status }: { status: OrderStatusToken }) {
  const { label, badge, dot } = statusStyle[status];

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-caption font-semibold ${badge}`}>
      <span aria-hidden className={`size-1.5 rounded-pill ${dot}`} />
      {label}
    </span>
  );
}
