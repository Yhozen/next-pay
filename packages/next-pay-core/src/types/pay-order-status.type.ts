export type NextPayOrderStatusType = 'PENDING' | 'APPROVED' | 'REJECTED'
export type NextPayOrderStatus = NextPayOrderStatusType

export const NextPayOrderStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const satisfies Record<NextPayOrderStatusType, NextPayOrderStatusType>
