"use client";
import { sdk } from "@/helpers/next-pay.sdk";
import { useAtom } from "jotai";
import type { SupportedCurrencies } from "next-pay-sdk";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { serviceAtom } from "./serviceAtom";
import { SelectProvider } from "./service-selector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
        <select
          onChange={(e) =>
            setSelectedCurrency(e.target.value as SupportedCurrencies)
          }
        >
          {data.map((currency) => (
            <option key={currency}>{currency}</option>
          ))}
        </select>
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
