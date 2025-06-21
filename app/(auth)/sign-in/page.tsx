import AuthForm from "@/components/AuthForm";
import React from "react";

export const metadata = {
  title: "Sign In - Drivo",
};

const SignInPage = () => {
  return <AuthForm formType="SIGN_IN" />;
};

export default SignInPage;
