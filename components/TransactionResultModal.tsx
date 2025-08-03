"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CircleCheckBig } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { useSearchParams } from "next/navigation";

type TransactionData = {
  planName: string;
  planPrice: number;
  cardBrand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

const TransactionResultModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const show = searchParams.get("payment") === "true";

  useEffect(() => {
    if (show) setIsModalOpen(true);
  }, [show]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const res = await fetch("/api/payments");
      const { success, data } = await res.json();
      if (!success) {
        setIsModalOpen(false);
        setIsLoading(false);
        return toast.error("Something went wrong");
      }
      console.log(data?.cardBrand?.slice(1));
      setData(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const expMonth = data?.expMonth?.toString().padStart(2, "0") ?? "??";
  const expYear = data?.expYear?.toString().slice(-2) ?? "??";
  const cardDate = `${expMonth}/${expYear}`;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="p-3 sm:p-6">
        <DialogHeader className={`gap-7 ${isLoading ? "hidden" : ""}`}>
          <div className="flex flex-col items-center gap-3.5">
            <div className="bg-green/30 max-w-fit rounded-md p-2">
              <CircleCheckBig size={30} className="text-green" />
            </div>
            <DialogTitle className="text-light-1 !h2">
              Payment Completed
            </DialogTitle>
          </div>
        </DialogHeader>
        {isLoading ? (
          <>
            <div className="flex flex-col items-center gap-7">
              <Skeleton className="size-11.5" />
              <Skeleton className="h-[36px] w-[256px]" />
            </div>
            <Skeleton className="h-[248px]" />
          </>
        ) : (
          <>
            <div className="text-light-1 flex flex-col gap-5 rounded-lg bg-[#F2F4F8] px-5 py-4">
              <div className="flex justify-between">
                <p className="font-semibold">Plan:</p>
                <div className="flex flex-col items-end">
                  <p className="font-medium">{data?.planName || "??"}</p>
                  <p className="text-xs font-semibold opacity-50">Monthly</p>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold">Payment Method:</p>
                <p className="font-medium">
                  {data?.cardBrand
                    ? data.cardBrand.charAt(0).toUpperCase() +
                      data.cardBrand.slice(1)
                    : "??"}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold">Card Number:</p>
                <p className="font-medium">
                  **** **** **** {data?.last4 || "??"}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold">Card Date:</p>
                <p className="font-medium">{cardDate}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-semibold">Total:</p>
                <p className="font-medium">
                  ${data?.planPrice?.toString() || "??"}
                </p>
              </div>
            </div>
            <DialogFooter className="!flex-row !justify-center">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="text-light-1 !button w-[250px]"
                >
                  Got it
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionResultModal;
