"use client";

import { useSearchParams } from "next/navigation";
import { ClubSignUpForm, EventForm } from "@/components/global/club/form";

const Form = () => {
  const form = useSearchParams();
  if (form.get("type") == "createEvent") {
    return (
      <>
        <div className="pt-8">
          <img
            src="/logo.svg"
            alt="Campus Web"
            className="h-9 w-auto mx-auto"
          />
        </div>
        <EventForm />
      </>
    );
  } else if (form.get("type") == "clubSignUp") {
    return (
      <>
        <div className="pt-8">
          <img
            src="/logo.svg"
            alt="Campus Web"
            className="h-9 w-auto mx-auto"
          />
        </div>
        <ClubSignUpForm />
      </>
    );
  } else {
    return null;
  }
};

export default Form;
