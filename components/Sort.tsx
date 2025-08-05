"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { sortTypes } from "@/constants";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

const Sort = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSort = (value: string) => {
    router.push(`${pathname}?sort=${value}`);
  };

  if (!isHydrated) {
    return <Skeleton className="h-11 rounded-[8px] bg-black/5 sm:w-[210px]" />;
  }

  return (
    <Select onValueChange={handleSort} defaultValue={sortTypes[0].value}>
      <SelectTrigger
        className="shad-no-focus h-11 rounded-[8px] border-transparent bg-white !shadow-sm sm:w-[210px]"
        aria-label="sort button"
      >
        <SelectValue placeholder={sortTypes[0].value} />
      </SelectTrigger>
      <SelectContent className="!shadow-drop-3 !text-light-1">
        {sortTypes.map((sort) => (
          <SelectItem
            key={sort.label}
            className="!text-light-1 cursor-pointer"
            value={sort.value}
          >
            {sort.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Sort;
