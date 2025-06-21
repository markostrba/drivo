"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { sendEmailOTP, verifyEmailOTP } from "@/lib/actions/user.action";

import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OtpInput from "react-otp-input";
import { toast } from "sonner";
const OTPModal = ({
  accountId,
  email,
  isOpen,
  onClose,
}: {
  accountId: string;
  email: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("start");
    const { success, data, error } = await verifyEmailOTP({
      accountId,
      otpCode: otp,
    });
    setIsLoading(false);

    if (!success || !data) {
      console.log("submit otp", error);
      toast.error(error?.message);
      return;
    }
    console.log(data.sessionId, typeof data.sessionId);
    if (data.sessionId) return router.push("/");
  };

  const handleClose = () => {
    onClose();
    setOtp("");
  };

  const handleResendOtp = async () => {
    const result = await sendEmailOTP({ email });

    if (result.success) {
      return toast.success("A new OTP has been sent to your email.");
    } else {
      if (result.error) {
        return toast.error(result.error.message);
      }
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="w-[550px] max-w-[90%]! space-y-4 rounded-xl border-none! bg-white pt-10 pb-15 outline-none sm:px-4 md:rounded-[30px] md:px-9!">
        <AlertDialogHeader className="relative gap-4 text-center!">
          <button
            className="absolute -top-7 -right-1 sm:-top-4 sm:-right-2"
            onClick={handleClose}
          >
            <X size={20} />
          </button>
          <AlertDialogTitle className="h2">Enter OTP</AlertDialogTitle>
          <AlertDialogDescription className="body-2 text-light-1">
            We&apos;ve sent a code to {email}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <OtpInput
          value={otp}
          onChange={setOtp}
          numInputs={6}
          placeholder="000000"
          containerStyle="w-full gap-1 sm:gap-3"
          renderInput={(props) => (
            <input
              {...props}
              className="text-brand-100 placeholder:text-light-3 h2 font-inter h-[60px] flex-1 rounded-[12px] px-2 py-2.5 font-medium! shadow-[0_10px_30px_0_rgba(66,71,97,0.1)] outline-offset-[-3px] outline-red-400 not-placeholder-shown:outline-3 focus:outline-3 sm:h-[80px] sm:text-[48px]/12"
            />
          )}
        />
        <AlertDialogFooter className="flex flex-col! items-center gap-5">
          <AlertDialogAction
            className="button bg-brand hover:bg-red h-[50px] w-full rounded-[41px] px-4.5 py-2.5 text-white shadow-[0_8px_30px_0_rgba(65,89,214,0.3)]"
            disabled={isLoading}
            onClick={handleSubmit}
            type="button"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
                <span className="ml-2">Submitting...</span>
              </div>
            ) : (
              "Submit"
            )}
          </AlertDialogAction>
          <div>
            <span className="body-2!">Didn&apos;t get a code?</span>
            <button
              className="subtitle-2! text-brand ml-1"
              onClick={handleResendOtp}
            >
              Click to resend.
            </button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default OTPModal;
