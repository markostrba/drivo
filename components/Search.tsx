import React from "react";
import { Input } from "./ui/input";
import Image from "next/image";

const Search = () => {
  return (
    <div className="flex h-[52px] max-w-[482px] flex-1 items-center gap-[7px] rounded-[30px] px-4 shadow-[0_0_30px_0_rgba(89,104,178,0.06),_0_30px_40px_0_rgba(89,104,178,0.06)]">
      <Image
        src="/assets/icons/search.svg"
        alt="search"
        width={20}
        height={20}
      />
      <Input
        placeholder="Search..."
        className="shad-no-focus! subtitle-2 text-light-1 border-none shadow-none!"
      />
    </div>
  );
};

export default Search;
