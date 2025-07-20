import { cn, convertFileSize } from "@/lib/utils";
import React from "react";
import { Separator } from "./ui/separator";
import Image from "next/image";
import FormattedDateTime from "./FormattedDateTime";
import Link from "next/link";

const CardSummary = ({
  className,
  icon = "",
  title,
  size,
  circleColor,
  latestDate,
  url,
}: {
  className?: string;
  icon: string;
  title: string;
  size: number;
  circleColor: string;
  latestDate: string;
  url: string;
}) => {
  return (
    <li className="relative hover:scale-105">
      <Link href={url}>
        <div
          className="bg-red absolute -top-1.5 -left-1 flex size-13 items-center justify-center rounded-full"
          style={{
            backgroundColor: `rgb(${circleColor})`,
            boxShadow: `3px 5px 15px 0 rgba(${circleColor}, 0.5)`,
          }}
        >
          <Image src={icon || ""} alt={title} width={28} height={28} />
        </div>
        <div className={cn("cardSummary px-7 py-4 md:px-3 lg:px-7", className)}>
          <p className="h4 text-light-1 text-right">{convertFileSize(size)}</p>
          <div className="z-10 flex h-full flex-col justify-center text-[15px] text-black">
            <h1 className="h2 md:h5 text-light-1 text-center">{title}</h1>
            <Separator className="my-3 bg-[#A3B2C7] px-10" />
            <div className="flex flex-col gap-1 text-center">
              <p className="md:body-1 text-light-2 text-[20px]">Last Update</p>
              <FormattedDateTime
                date={latestDate}
                className="text-light-1 md:body-1 text-[20px]"
              />
              <p className="text-light-1 md:body-1 text-[20px]"></p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default CardSummary;
