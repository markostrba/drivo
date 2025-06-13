import AuthForm from "@/components/AuthForm";
import React from "react";

export const metadata = {
  title: "Sign Up - Drivo",
};

const SignUpPage = () => {
  return <AuthForm formType="SIGN_UP" />;
};

export default SignUpPage;
