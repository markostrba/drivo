"use client";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { UserDialogAction } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Gem,
  Mail,
  Trash,
  User,
} from "lucide-react";
import Image from "next/image";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
  useTransition,
} from "react";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { FileRejection, useDropzone } from "react-dropzone";
import {
  deleteAccount,
  sendEmailOTP,
  updateAvatar,
  updateEmail,
} from "@/lib/actions/user.action";
import { toast } from "sonner";
import OTPModal from "./OTPModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";

const AccountSettings = ({
  avatar,
  email,
  fullName,
  userId,
}: {
  avatar: string;
  email: string;
  fullName: string;
  userId: string;
}) => {
  const [newEmail, setNewEmail] = useState(email);
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  const handleSendingEmailOtp = () => {
    startTransition(async () => {
      const { error, data } = await sendEmailOTP({ email: email, userId });
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data) {
        setIsOtpOpen(true);
      }
    });
  };

  const handleOTPClose = () => {
    setIsOtpOpen(false);
  };

  const handleOTPSubmit = async (otp: string) => {
    const { success, error: updateError } = await updateEmail({
      newEmail,
      pathname,
      userId,
      otp,
    });

    if (updateError) {
      toast.error(updateError?.message);
      return;
    }
    if (success) {
      toast.success("Email updated successfull");
    }

    setIsOtpOpen(false);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log({ acceptedFiles });
      const { error } = await updateAvatar({
        newAvatar: acceptedFiles[0],
        pathname,
      });
      if (error) {
        toast.error("Failed to upload picture", { description: error.message });
      }
    },
    [pathname],
  );

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const error = fileRejections[0]?.errors[0];
    switch (error.code) {
      case "file-too-large":
        toast.error("Failed to upload picture", {
          description: "File is too large. Max size is 5MB.",
        });
        break;
      case "too-many-files":
        toast.error("Failed to upload picture", {
          description: "Only one file can be uploaded.",
        });
        break;
      case "file-invalid-type":
        toast.error("Failed to upload picture", {
          description:
            "Unsupported file type. Please upload a PNG, JPG, or JPEG image.",
        });
        break;
      default:
        toast.error("File could not be uploaded.");
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    onDrop,
    onDropRejected,
  });

  const handleDeleteAccount = async () => {
    const { error, success } = await deleteAccount();

    if (error) {
      toast.error("Failed to delete an account", {
        description: error.message,
      });
    }
    if (success) {
      toast.success("Your Account was deleted");
    }
  };

  return (
    <>
      <div className="text-light-1 flex h-full flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex h-full gap-3">
              <Image
                src={avatar}
                width={80}
                height={80}
                alt="Your profile picture"
                className="aspect-square rounded-full object-cover shadow-sm outline-black/10"
              />
              <div className="flex flex-col justify-between pt-2">
                <div>
                  <h1 className="text-light-1 text-lg font-medium">
                    Profile Photo
                  </h1>
                  <p className="text-light-2 text-xs">
                    PNG, JPG, JPEG under 5MB
                  </p>
                </div>
                <div {...getRootProps()}>
                  <input {...getInputProps()} disabled={isPending} />
                  <div className="text-brand hover:text-brand-100 text-xs !font-medium">
                    Upload New Photo
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Separator className="mb-2" />
          {/* <h3 className="h5 leading-[16px] font-medium">Full name</h3> */}
          <div>
            <Label
              className="text-light-1 !h5 pl-1 !font-medium"
              htmlFor="FullName"
            >
              Full name
            </Label>
            <Tooltip>
              <TooltipTrigger className="w-full">
                <Input
                  disabled
                  id="FullName"
                  value={fullName}
                  className="!text-light-1 !shadow-sm"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>Name cannot be changed</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div>
            <div className="flex justify-between">
              <Label
                className="text-light-1 !h5 pl-1 !font-medium"
                htmlFor="email"
              >
                Email Address
              </Label>
              <button
                className="shad-no-focus text-brand hover:text-brand-100 pr-2 text-xs disabled:pointer-events-none disabled:opacity-50"
                disabled={newEmail === email || isPending}
                onClick={handleSendingEmailOtp}
              >
                Change
              </button>
            </div>
            <div className="border-input focus-within:border-ring focus-within:ring-ring/50 hover:bg-accent flex h-9 items-center gap-2 rounded-md border px-3 py-1 shadow-xs focus-within:ring-[3px]">
              <Mail size={18} className="text-light-1/70" />
              <input
                type="email"
                id="email"
                value={newEmail}
                disabled={isPending}
                onChange={(e) => setNewEmail(e.target.value)}
                aria-label="change email input"
                className="selection:text-light-1 placeholder:text-muted-foreground shad-no-focus w-full min-w-0 bg-transparent text-base md:text-sm"
              />
            </div>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger className="max-w-fit" asChild>
            <Button
              variant="outline"
              className="!text-brand hover:bg-brand/5 w-fit rounded-lg px-2 !text-[12px] !font-medium !shadow-sm"
            >
              <Trash size={15} className="text-brand" />
              Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="!text-light-1 !max-w-[300px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="!text-center">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="!text-left !text-xs">
                This action cannot be undone.
                <br />
                This will permanently delete your account and remove your data
                from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="!flex-row !items-center !justify-center">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="!bg-brand hover:bg-brand-100!"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <OTPModal
        email={newEmail}
        isOpen={isOtpOpen}
        onClose={handleOTPClose}
        onSubmit={handleOTPSubmit}
      />
    </>
  );
};

const SubscriptionSettings = () => {
  return <div>subscription</div>;
};

const UserDialogContent = ({
  email,
  avatar,
  action,
  setAction,
  fullName,
  userId,
}: {
  action: UserDialogAction;
  setAction: Dispatch<SetStateAction<UserDialogAction>>;
  email: string;
  avatar: string;
  fullName: string;
  userId: string;
}) => {
  return (
    <DialogContent className="text-light-1 flex min-h-[500px] flex-col !rounded-[30px] p-0 md:min-w-[600px] lg:!top-[35%]">
      <div className="flex items-center px-4.5 pt-7 md:hidden">
        <button onClick={() => setAction(UserDialogAction.Default)}>
          <ChevronLeft
            size={24}
            className={`text-light-1 ${UserDialogAction.Default === action ? "hidden" : "block"}`}
          />
        </button>
        <DialogTitle className="text-light-1 flex-1 text-center text-[24px] md:hidden">
          {action}
        </DialogTitle>
      </div>
      <div className="flex h-full !flex-1">
        <aside
          className={cn(
            "flex-1 md:shadow-xl",
            `${UserDialogAction.Default !== action ? "hidden md:block" : ""}`,
          )}
        >
          <ul className="flex flex-col md:pt-12.5">
            <li>
              <button
                className={`hover:bg-accent/70 shad-no-focus flex w-full items-center justify-between p-3 pl-6 md:px-4 ${UserDialogAction.Account === action ? "md:bg-accent/70" : ""}`}
                onClick={() => setAction(UserDialogAction.Account)}
              >
                <div className="flex items-center gap-4">
                  <User size={24} className="md:hidden" />
                  <span className="md:body-1 text-[20px] md:text-[18px]">
                    Account
                  </span>
                </div>
                <ChevronRight size={24} className="text-light-1 md:hidden" />
              </button>
            </li>
            <li>
              <button
                className={`hover:bg-accent/70 shad-no-focus flex w-full items-center justify-between p-3 pl-6 md:px-4 ${UserDialogAction.Subscription === action ? "md:bg-accent/70" : ""}`}
                onClick={() => setAction(UserDialogAction.Subscription)}
              >
                <div className="flex items-center gap-4">
                  <Gem size={24} className="md:hidden" />
                  <span className="md:body-1 text-[20px] md:text-[18px]">
                    Subscription
                  </span>
                </div>
                <ChevronRight size={24} className="text-light-1 md:hidden" />
              </button>
            </li>
          </ul>
        </aside>
        <div
          className={cn(
            "hidden flex-2/3 px-4.5 pb-4.5 md:pt-12.5",
            `${UserDialogAction.Default !== action ? "block" : "hidden md:block"}`,
          )}
        >
          {UserDialogAction.Default === action && (
            <div className="flex h-full items-center justify-center gap-3">
              <p className="h3 text-light-1/30">
                Pick a setting on the left to get started
              </p>
            </div>
          )}

          {UserDialogAction.Account === action && (
            <AccountSettings
              avatar={avatar}
              email={email}
              fullName={fullName}
              userId={userId}
            />
          )}
          {UserDialogAction.Subscription === action && <SubscriptionSettings />}
        </div>
      </div>
    </DialogContent>
  );
};

export default UserDialogContent;
