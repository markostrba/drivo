"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description: string;
  price: number;
  perks: string[];
  cardStyle?: string;
  planButtonText?: string;
  buttonStyle?: string;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

const PlanCard = ({
  title,
  description,
  price,
  perks,
  cardStyle,
  planButtonText = "Get started",
  buttonStyle,
  buttonProps,
}: Props) => {
  return (
    <Card
      className={cn(
        "text-light-1 max-w-[320px] gap-7 lg:hover:scale-105",
        cardStyle,
      )}
    >
      <CardHeader className="gap-5">
        <CardTitle className="!h3">{title}</CardTitle>
        <CardDescription className="h-[60px]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-7">
        <div className="flex items-end gap-1">
          <h2 className="h1 text-4xl leading-9">${price}</h2>
          <p className="h5 align-text-bottom">/month</p>
        </div>
        <Button
          className={cn(
            "bg-brand-100 hover:bg-brand-100/90 rounded-2xl py-5",
            buttonStyle,
          )}
          {...buttonProps}
          onClick={async () => {
            const response = await fetch(`/api/payments`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ plan: title }),
              cache: "no-store",
            });
            console.log(response, "response");
            const { data } = await response.json();
            window.location.href = data;
          }}
        >
          {planButtonText}
        </Button>
      </CardContent>
      <CardFooter className="text-muted-foreground/65 flex flex-col items-start gap-2">
        {perks.map((perk, index) => (
          <div className="flex gap-2" key={index}>
            <BadgeCheck width={20} height={20} className="mt-0.5 shrink-0" />
            <p className="body-1">{perk}</p>
          </div>
        ))}
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
