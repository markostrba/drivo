"use client";
import React, { useState } from "react";
import { Dialog } from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Image from "next/image";
import { Models } from "appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { generateDownloadUrl } from "@/lib/utils";
import { ActionType } from "@/types/global";

import { ActionDialogContent } from "./ActionDialogContent";
import { usePathname } from "next/navigation";
import { renameFile } from "@/lib/actions/file.action";
import { toast } from "sonner";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<ActionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState<string>(file.name);

  const pathname = usePathname();

  const handleCloseAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setActionDialog(null);
    setName(file.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setName(e.target.value);

  const handleAction = async () => {
    if (!actionDialog) return;
    setIsLoading(true);

    const actions = {
      rename: () =>
        renameFile({
          fileId: file.$id,
          name,
          extension: file.extension,
          pathname,
        }),
    };

    const { error, data } =
      await actions[actionDialog.value as keyof typeof actions]();

    if (error) {
      toast.error(error.message);
    } else {
      handleCloseAllModals();
      setName(data!.name);
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-[20px] border-none !px-6.5 !py-4 shadow-[0_8px_30px_0_rgba(65,89,214,0.1)]">
          <DropdownMenuLabel className="!h3 !text-light-1 mb-2.5 w-[295px] truncate !p-0">
            {file.name}
          </DropdownMenuLabel>
          {actionsDropdownItems.map((item, index) => (
            <DropdownMenuItem
              key={item.value}
              className={`!body-2 !text-light-1 cursor-pointer rounded-none !p-0 !py-2.5 ${actionsDropdownItems.length - 1 !== index ? "border-b-text-light-2 border-b" : ""}`}
              onClick={() => {
                setActionDialog(item);
                if (
                  ["rename", "share", "delete", "details"].includes(item.value)
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {item.value === "download" ? (
                <Link
                  href={generateDownloadUrl(file.bucketFieldId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={30}
                    height={30}
                  />
                  {item.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={30}
                    height={30}
                  />
                  {item.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ActionDialogContent
        action={actionDialog}
        onNameChange={handleNameChange}
        file={file}
        onCloseAllModals={handleCloseAllModals}
        name={name}
        onAction={handleAction}
        isLoading={isLoading}
      />
    </Dialog>
  );
};

export default ActionDropdown;
