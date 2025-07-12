import React, { useEffect, useState } from "react";
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
import { getUsersByEmail } from "../lib/actions/user.action";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { removeUserFromFile } from "@/lib/actions/file.action";

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
  onEmailChange: OnNameChange;
  email: string;
  pathname: string;
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
      className="text-light-1 !body-2 shad-no-focus !shadow-3 h-[52px] rounded-[30px] border-none !p-4"
    />
  );
};

const FileDelete = ({ file }: { file: File }) => {
  return (
    <p className="body-2 text-light-1 text-center px-2 mb-5.5">
      Are you sure you want to move
      <span className="subtitle-2 ml-1">{file.name} </span>file to Trash?
    </p>
  );
};

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

const FileShare = ({
  file,
  onEmailChange,
  email,
  pathname,
}: {
  file: File;
  onEmailChange: OnNameChange;
  email: string;
  pathname: string;
}) => {
  const [sharedWithUsers, setSharedWithUsers] = useState<
    {
      fullName: string;
      email: string;
      avatar: string;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!file.users.length) return;
    const fetchUsers = async () => {
      setIsLoading(true);
      const { error, data } = await getUsersByEmail(file.users);
      if (error instanceof Error) {
        toast.error("Failed to load shared users", {
          description: error.message,
        });
      } else {
        setSharedWithUsers(data!);
      }
      setIsLoading(false);
    };
    fetchUsers();
  }, [file.users]);

  const handleRemoveUser = async (email: string) => {
    const { error } = await removeUserFromFile({
      email,
      fileId: file.$id,
      pathname,
    });
    if (error)
      toast.error("Failed to remove user", { description: error.message });
    setSharedWithUsers((prev) => prev.filter((user) => user.email !== email));
  };
  return (
    <div className="flex flex-col gap-7.5">
      <ImageThumbnail file={file} />

      <div className="text-light-1 space-y-7.5">
        <div className="flex flex-col gap-2.5">
          <p className="subtitle-2 pl-1">Share file with other users:</p>
          <Input
            type="email"
            placeholder="Enter email address"
            onChange={(e) => onEmailChange(e)}
            value={email}
            className="!shadow-3 !border-text-light-2 focus-visible:border-text-light-2 !shad-no-focus body-2 !text-light-2 placeholder:text-light-2 h-[52px] rounded-[30px] !border !px-5 !py-4"
          />
        </div>
        <div className="flex flex-col gap-5 px-3">
          {isLoading ? (
            <>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-30" />
                <Skeleton className="h-4 w-15" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-30" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <p className="subtitle-2 text-light-1">Shared with</p>
                <p className="subtitle-2 text-light-2">
                  {sharedWithUsers.length} users
                </p>
              </div>

              <ul className="flex flex-col gap-2">
                {sharedWithUsers.map(({ email, fullName, avatar }) => (
                  <li key={email} className="flex items-center justify-between">
                    <div className="flex items-center justify-center gap-2">
                      <Image
                        src={avatar}
                        alt="Remove"
                        width={40}
                        height={40}
                        className="aspect-square rounded-full"
                      />
                      <div className="flex flex-col">
                        <p className="body-2">{fullName}</p>
                        <p className="body-2">{email}</p>
                      </div>
                    </div>
                    <button
                      className=""
                      onClick={() => handleRemoveUser(email)}
                    >
                      <Image
                        src="/assets/icons/remove.svg"
                        alt="Remove"
                        width={25}
                        height={25}
                        className="aspect-square rounded-full opacity-40 hover:opacity-80"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const ActionDialogContent = ({
  action,
  onNameChange,
  file,
  onCloseAllModals,
  name,
  isLoading,
  onAction,
  onEmailChange,
  email,
  pathname,
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
        {value === "share" && (
          <FileShare
            file={file}
            onEmailChange={onEmailChange}
            email={email}
            pathname={pathname}
          />
        )}
        {value === "delete" && <FileDelete file={file} />}
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
            className="bg-brand hover:bg-brand-100 button !shadow-2 !mx-0 h-[52px] w-full flex-1 rounded-full transition-all"
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
