'use client'
import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import type { SupportedCurrencies } from 'next-pay-sdk'
import useSWR from 'swr'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { sdk } from '@/helpers/next-pay.sdk'

import { serviceAtom } from './serviceAtom'

export const SelectProvider = ({
  currency,
}: {
  currency: SupportedCurrencies;
}) => {
  const { data, error } = useSWR(`supported_services/${currency}`, () =>
    sdk.getSupportedProviderForCurrency(currency),
  )
  const setService = useSetAtom(serviceAtom)
  const isLoading = !data && !error

  useEffect(() => {
    if (!isLoading && data && data[0]) setService(data[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  if (!data && !error) return <p>loading...</p>

  if (error) return <p>{JSON.stringify(error)}</p>

  if (!data) return <p>no data</p>

  return (
    <Select onValueChange={setService}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Provider" />
      </SelectTrigger>
      <SelectContent>
        {data.map(provider => (
          <SelectItem value={provider} key={provider}>
            {provider}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
