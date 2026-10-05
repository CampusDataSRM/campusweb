import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type { CreateEventInput, StatusMessageResponse } from "@/network-calls/types";

/** POST /users/create-event - multipart, banner included. Club token required. */
export async function postCreateEvent(input: CreateEventInput, config?: RequestConfig): Promise<StatusMessageResponse> {
  const form = new FormData();
  form.append("title", input.title);
  form.append("websiteLink", input.websiteLink);
  form.append("eventDates", `${input.startDate} to ${input.endDate}`);
  form.append("eventTiming", `${input.startTime} to ${input.endTime}`);
  form.append("odsProvided", String(input.odsProvided));
  form.append("refreshmentsProvided", String(input.refreshmentsProvided));
  for (const label of input.labels) form.append("labels[]", label);
  form.append("BannerImg", input.banner);
  const { data } = await apiClient.post<StatusMessageResponse>("/users/create-event", form, {
    ...config,
    headers: { ...config?.headers, "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** DELETE /users/deleteevent - the id travels in the `eventid` header. */
export async function deleteClubEvent(eventId: string, config?: RequestConfig): Promise<StatusMessageResponse> {
  const { data } = await apiClient.delete<StatusMessageResponse>("/users/deleteevent", {
    ...config,
    headers: { ...config?.headers, eventid: eventId },
  });
  return data;
}
