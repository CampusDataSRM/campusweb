"use client";

import { useSearchParams } from "next/navigation";
import { EventForm } from "@/components/global/club/form";

const Form = () => {
  const form = useSearchParams();
  if (form.get("type") == "createEvent") {
    return (
      <>
        <EventForm />
      </>
    );
  }
};

export default Form;
