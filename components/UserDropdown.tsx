"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";
import Image from "next/image";
import { LogOut, User as UserIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { UserDialogAction, User } from "@/types";
import UserDialogContent from "./UserDialogContent";
import { signOutUser } from "@/lib/actions/user.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props
  extends Pick<User, "fullName" | "avatar" | "email" | "accountId" | "$id"> {
  avatarClassName?: string;
}

const UserDropdown = ({
  avatar,
  $id: userId,
  avatarClassName,
  ...userProps
}: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [action, setAction] = useState<UserDialogAction>(
    UserDialogAction.Default,
  );
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      const { error } = await signOutUser();
      if (error) {
        toast.error(error.message);
      } else {
        router.push("/sign-in");
      }
    });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setAction(UserDialogAction.Default);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
      <DropdownMenu>
        <DropdownMenuTrigger className="focus-visible:outline-0">
          <div className="cursor-pointer">
            <Image
              src={avatar}
              alt="avatar"
              width={52}
              height={52}
              className={cn(
                "aspect-square rounded-full object-cover hover:scale-105 focus-visible:outline-0",
                avatarClassName,
              )}
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="text-light-1 min-w-[200px]">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Image
              src={avatar}
              alt="avatar"
              width={52}
              height={52}
              className="aspect-square size-11 rounded-full object-cover hover:scale-105 focus-visible:outline-0"
            />
            <div className="text-light-1 mb-1 flex max-w-fit flex-col">
              <span className="text-[14px] font-medium">
                {userProps.fullName}
              </span>
              <span className="text-[10px] leading-2">{userProps.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="!body-2"
            disabled
            onClick={() => setIsDialogOpen(true)}
          >
            <div className="flex items-center gap-1">
              <UserIcon size={25} className="text-light-1" />
              <span>Account Settings</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem className="!body-2">
            <div className="flex items-center gap-1">
              <LogOut size={25} className="text-light-1" />

              <button onClick={handleLogout} disabled={isPending}>
                Log out
              </button>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserDialogContent
        action={action}
        setAction={setAction}
        avatar={avatar}
        userId={userId}
        {...userProps}
      />
    </Dialog>
  );
};

export default UserDropdown;
