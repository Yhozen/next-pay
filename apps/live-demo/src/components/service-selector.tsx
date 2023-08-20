"use client";
import type { SupportedCurrencies } from "next-pay-sdk";
import useSWR from "swr";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { sdk } from "@/helpers/next-pay.sdk";
import { serviceAtom } from "./serviceAtom";

export const SelectProvider = ({
  currency,
}: {
  currency: SupportedCurrencies;
}) => {
  const { data, error } = useSWR(`supported_services/${currency}`, () =>
    sdk.getSupportedProviderForCurrency(currency)
  );
  const [, setService] = useAtom(serviceAtom);
  const isLoading = !data && !error;

  useEffect(() => {
    if (!isLoading && data && data[0]) setService(data[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (!data && !error) return <p>loading...</p>;

  if (error) return <p>{JSON.stringify(error)}</p>;
  if (!data) return <p>no data</p>;

  return (
    <select onChange={(e) => setService(e.target.value)}>
      {data.map((currency) => (
        <option key={currency}>{currency}</option>
      ))}
    </select>
  );
};
