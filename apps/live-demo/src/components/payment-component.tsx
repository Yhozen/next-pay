"use client";
import { sdk } from "@/helpers/next-pay.sdk";
import { useAtom } from "jotai";
import type { SupportedCurrencies } from "next-pay-sdk";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { serviceAtom } from "./serviceAtom";
import { SelectProvider } from "./service-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CreatePayment = () => {
  const { data, error } = useSWR(
    "supported_currencies",
    sdk.getSupportedCurrencies
  );
  const [service] = useAtom(serviceAtom);
  const [link, setLink] = useState<string>();

  const [selectedCurrency, setSelectedCurrency] =
    useState<SupportedCurrencies>();

  const [amount, setAmount] = useState(1000);
  const isLoading = !data && !error;

  useEffect(() => {
    if (!isLoading && data) setSelectedCurrency(data[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (error) return <p>{JSON.stringify(error)}</p>;

  const onClick = async () => {
    console.log({ service });

    if (!selectedCurrency) return;

    const data = await sdk.requestPaymentLink({
      service: service as "mercadopago",
      selectedCurrency: selectedCurrency as "CLP",
      amount,
      referenceId: (Math.random() + 1).toString(36).substring(2),
    });

    console.log(data);
    setLink(data.link);
  };

  return (
    <div style={{ width: "400px" }}>
      {!data ? (
        <p>loading...</p>
      ) : (
        <Select
          onValueChange={(value) =>
            setSelectedCurrency(value as SupportedCurrencies)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            {data.map((currency) => (
              <SelectItem value={currency} key={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {selectedCurrency && <SelectProvider currency={selectedCurrency} />}
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <Button onClick={onClick}>Pay 🤑</Button>
      {link && (
        <a href={link} target="_blank" rel="noreferrer">
          ir pago
        </a>
      )}
    </div>
  );
};
