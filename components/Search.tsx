"use client";
import { Input } from "./ui/input";
import Image from "next/image";

import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { Skeleton } from "./ui/skeleton";
import { useSearch } from "@/hooks/useSearch";
import Link from "next/link";

const Search = ({
  ownerId,
  userEmail,
}: {
  ownerId: string;
  userEmail: string;
}) => {
  const { query, setQuery, results, isLoading, isOpen, setIsOpen, setResults } =
    useSearch({
      ownerId,
      userEmail,
    });

  const handleClickItem = () => {
    setIsOpen(false);
    setResults([]);

    setQuery("");
  };

  return (
    <div className="!shadow-3 relative max-w-[482px] flex-1 gap-[7px] rounded-[30px] px-4">
      <div className="flex h-[52px] items-center">
        <Image
          src="/assets/icons/search.svg"
          alt="search"
          width={20}
          height={20}
        />
        <Input
          placeholder="Search..."
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          style={{ caretColor: "#fa7275" }}
          className="shad-no-focus! subtitle-2 text-light-1 border-none shadow-none!"
        />
      </div>
      {isOpen && (
        <ul className="absolute top-16 left-0 z-50 flex w-full flex-col gap-3 rounded-[30px] bg-white p-4">
          {isLoading ? (
            <div className="flex w-full gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-12 flex-1 !rounded-3xl" />
            </div>
          ) : results.length ? (
            results.map((file) => (
              <li key={file.$id}>
                <Link
                  href={`/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`}
                  onClick={handleClickItem}
                  className="flex items-center justify-between"
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 text-light-1 line-clamp-1">
                      {file.name}
                    </p>
                  </div>

                  <FormattedDateTime
                    date={file.$createdAt}
                    className="caption text-light-2 line-clamp-1"
                  />
                </Link>
              </li>
            ))
          ) : (
            <p className="body-2 text-light-1 text-center">No files found</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;
