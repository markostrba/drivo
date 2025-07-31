import { cn, getFileIcon } from "@/lib/utils";
import Image from "next/image";
import React from "react";

interface Props {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
}

const Thumbnail = ({
  type,
  extension,
  url = "",
  imageClassName,
  className,
}: Props) => {
  const isImage = type === "image" && extension !== "svg" && !!url;
  return (
    <div
      className={cn(
        "bg-brand/10 flex size-[50px] min-w-[50px] items-center justify-center overflow-hidden rounded-full",
        className,
      )}
    >
      <Image
        src={isImage ? url : getFileIcon(extension, type)}
        alt="thumbnail"
        width={100}
        height={100}
        className={cn(
          "size-8 object-contain",
          imageClassName,
          isImage && "!size-full !object-cover !object-center",
        )}
      />
    </div>
  );
};

export default Thumbnail;
