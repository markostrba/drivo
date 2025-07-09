"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./ui/dialog";
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
import { DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);
  const [actionDialog, setActionDialog] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setActionDialog(null);
    setName(file.name);
  };

  const renderDialogContent = () => {
    if (!actionDialog) return null;

    const { value, label } = actionDialog;

    return (
      <DialogContent className="button w-[90%] max-w-[400px] rounded-[26px] px-6 py-8">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-light-1 !h3 text-center">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {value === "details" && <div>file details</div>}
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
            <Button
              onClick={closeAllModals}
              className="text-light-1 h-[52px] flex-1 rounded-full bg-white hover:bg-transparent"
            >
              Cancel
            </Button>
            <Button className="bg-brand hover:bg-brand-100 button !mx-0 h-[52px] w-full flex-1 rounded-full transition-all">
              <p className="capitalize">{value}</p>
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
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
            <>
              <DropdownMenuItem
                key={item.value}
                className={`!body-2 !text-light-1 cursor-pointer rounded-none !p-0 !py-2.5 ${actionsDropdownItems.length - 1 !== index ? "border-b-text-light-2 border-b" : ""}`}
                onClick={() => {
                  setActionDialog(item);
                  if (
                    ["rename", "share", "delete", "details"].includes(
                      item.value,
                    )
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
            </>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropdown;
