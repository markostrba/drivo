import React from "react";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Models } from "appwrite";
import { ActionType } from "@/types/global";
import Image from "next/image";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";

type File = Models.Document;
type OnNameChange = (e: React.ChangeEvent<HTMLInputElement>) => void;
interface Props {
  action: ActionType | null;
  file: File;
  name: string;
  onNameChange: OnNameChange;
  onCloseAllModals: () => void;
  isLoading: boolean;
  onAction: () => void;
}

const ImageThumbnail = ({ file }: { file: File }) => (
  <div className="border-text-light-2 text-light-1 flex h-[80px] items-center gap-[15px] rounded-[12px] border pl-3.5">
    <Thumbnail type={file.type} extension={file.extension} url={file.url} />
    <div className="flex flex-col">
      <p className="subtitle-2 mb-1">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="text-light-1 flex">
    <p className="body-2 w-[30%] text-left opacity-60">{label}</p>
    <p className="subtitle-2 flex-1 text-left">{value}</p>
  </div>
);

const FileRename = ({
  onNameChange,
  value,
}: {
  onNameChange: OnNameChange;
  value: string;
}) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onNameChange(e)}
      className="text-light-1 !body-2 shad-no-focus h-[52px] rounded-[30px] border-none !p-4 !shadow-[0_8px_30px_0_rgba(65,89,214,0.1)]"
    />
  );
};

const FileDelete = (file: File) => {};

const FileDetails = ({ file }: { file: File }) => {
  return (
    <div className="flex flex-col gap-4">
      <ImageThumbnail file={file} />
      <div className="space-y-4.5 pl-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner.fullName} />
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
      </div>
    </div>
  );
};

const FileShare = (file: File) => {};

export const ActionDialogContent = ({
  action,
  onNameChange,
  file,
  onCloseAllModals,
  name,
  isLoading,
  onAction,
}: Props) => {
  if (!action) return null;

  const { value, label } = action;

  return (
    <DialogContent className="button w-[90%] !max-w-[400px] rounded-[26px] border-none px-6.5 py-5">
      <DialogHeader className="flex flex-col gap-9">
        <DialogTitle className="text-light-1 !h3 text-center">
          {label}
        </DialogTitle>
        {value === "rename" && (
          <FileRename onNameChange={onNameChange} value={name} />
        )}
        {value === "details" && <FileDetails file={file} />}
        {value === "share" && <div>share</div>}
        {value === "delete" && (
          <p className="text-light-1 text-center">
            Are you sure you want to delete{` `}
            <span className="text-brand-100 font-medium">{file.name}</span>?
          </p>
        )}
      </DialogHeader>
      {["rename", "delete", "share"].includes(value) && (
        <DialogFooter className="flex flex-col gap-3 md:flex-row">
          {value === "delete" && (
            <Button
              onClick={onCloseAllModals}
              className="text-light-1 h-[52px] flex-1 rounded-full bg-white hover:bg-transparent"
            >
              Cancel
            </Button>
          )}
          <Button
            className="bg-brand hover:bg-brand-100 button !mx-0 h-[52px] w-full flex-1 rounded-full !shadow-[0_8px_30px_0_rgba(65,89,214,0.1)] transition-all"
            onClick={onAction}
          >
            <p className="capitalize">{value}</p>
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="animate-spin"
              />
            )}
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
  );
};
