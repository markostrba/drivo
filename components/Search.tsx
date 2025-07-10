import React from "react";
import { Input } from "./ui/input";
import Image from "next/image";

const Search = () => {
  return (
    <div className="!shadow-3 flex h-[52px] max-w-[482px] flex-1 items-center gap-[7px] rounded-[30px] px-4">
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
