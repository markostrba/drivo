import { Models } from "node-appwrite";
import Link from "next/link";
import Thumbnail from "@/components/Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";
import ActionDropdown from "./ActionDropdown";

const Card = ({ file, userId }: { file: Models.Document; userId: string }) => {
  return (
    <Link
      href={file.url}
      target="_blank"
      className="hover:shadow-1 flex cursor-pointer flex-col gap-6 rounded-[18px] bg-white p-5 shadow-sm transition-all"
    >
      <div className="flex justify-between">
        <Thumbnail
          type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
        />

        <div className="flex flex-col items-end justify-between">
          <ActionDropdown file={file} userId={userId} />
          <p className="body-1">{convertFileSize(file.size)}</p>
        </div>
      </div>

      <div className="text-light-1 flex flex-col gap-2">
        <p className="subtitle-2 line-clamp-1">{file.name}</p>
        <FormattedDateTime
          date={file.$createdAt}
          className="body-2 text-light-1"
        />
        <p className="caption text-light-2 line-clamp-1">
          By: {file.owner.fullName}
        </p>
      </div>
    </Link>
  );
};
export default Card;
