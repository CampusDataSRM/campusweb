"use client";

import { useSearchParams } from "next/navigation";
import { ClubSignUpForm, EventForm } from "@/components/global/club/form";

const Form = () => {
  const form = useSearchParams();
  if (form.get("type") == "createEvent") {
    return (
      <>
        <EventForm />
        <ClubSignUpForm />
      </>
    );
  }
};

export default Form;
