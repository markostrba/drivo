"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SignInSchema, SignUpSchema } from "@/lib/validations";
import { createAccount } from "@/lib/actions/user.action";
import OTPModal from "./OTPModal";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  formType: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = ({ formType }: Props) => {
  const isSignIn = formType === "SIGN_IN";
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [accountId, setAccountId] = useState("");

  // 1. Define your form.
  const form = useForm<z.infer<typeof SignInSchema | typeof SignUpSchema>>({
    resolver: zodResolver(isSignIn ? SignInSchema : SignUpSchema),
    defaultValues:
      formType === "SIGN_UP" ? { fullName: "", email: "" } : { email: "" },
  });

  // 2. Define a submit handler.
  async function onSubmit(
    values: z.infer<typeof SignInSchema | typeof SignUpSchema>,
  ) {
    if (!isSignIn) {
      const result = await createAccount(
        values as z.infer<typeof SignUpSchema>,
      );

      if (result.success && result.data) {
        setIsOtpOpen(true);
        setAccountId(result.data?.accountId);
        console.log(result.data, "sgfofs");
      } else {
        console.log(result.error);
        toast.error(result.error?.message);
      }
    }
  }

  const handleOTPClose = () => {
    setAccountId("");
    form.reset(isSignIn ? { email: "" } : { fullName: "", email: "" });
    setIsOtpOpen(false);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="text-light-1! flex h-[436px] w-full max-w-[580px] flex-col justify-center space-y-9!"
        >
          <h1 className="h1 mb-9">{isSignIn ? "Login" : "Create Account"}</h1>
          {formType === "SIGN_UP" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => {
                const error = form.formState.errors as FieldErrors<
                  typeof SignUpSchema.shape
                >;
                return (
                  <FormItem className="gap-1.5">
                    <div
                      className={`flex h-[78px] w-full flex-col gap-1.5 rounded-xl p-4 shadow-[0_10px_30px_0_rgba(66,71,97,0.1)] ${error.fullName ? "border-brand border" : ""}`}
                    >
                      <FormLabel className="body-2! text-light-1! h-5">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          className="shad-no-focus text-light-1! placeholder:text-light-2 subtitle-2 border-none p-0 shadow-none placeholder:opacity-50"
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-brand ml-4" />
                  </FormItem>
                );
              }}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="gap-1.5">
                <div
                  className={`flex h-[78px] w-full flex-col gap-1.5 rounded-xl p-4 shadow-[0_10px_30px_0_rgba(66,71,97,0.1)] ${form.formState.errors.email ? "border-brand border" : ""}`}
                >
                  <FormLabel className="body-2! text-light-1! h-5">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your Email"
                      {...field}
                      className="shad-no-focus text-light-1! placeholder:text-light-2 subtitle-2 border-none p-0 shadow-none placeholder:opacity-50"
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-brand ml-4" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="button-primary! h-16.5 w-full p-4.5 shadow-[0_10px_30px_0_#4159d64d]"
          >
            {isSignIn ? "Login" : "Create Account"}
          </Button>
          <div className="text-center">
            <span className="body-2 text-light-1">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}
              <Link
                href={isSignIn ? "/sign-up" : "/sign-in"}
                className="text-brand ml-1"
              >
                {isSignIn ? "Create Account" : "Login"}
              </Link>
            </span>
          </div>
        </form>
      </Form>
      <OTPModal
        accountId={accountId}
        email={form.getValues("email")}
        isOpen={isOtpOpen}
        onClose={handleOTPClose}
      />
    </>
  );
};

export default AuthForm;
