"use client";

import { useSearchParams } from "next/navigation";
import { ClubSignUpForm, EventForm } from "@/components/global/club/form";

const Form = () => {
  const form = useSearchParams();
  if (form.get("type") == "createEvent") {
    return (
      <>
        <EventForm />
      </>
    );
  } else if (form.get("type") == "clubSignUp") {
    return (
      <>
        <ClubSignUpForm />
      </>
    );
  } else {
    return null;
  }
};

export default Form;
