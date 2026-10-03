import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type {
  ClubProfileInput,
  ClubProfileResponse,
  ClubRegisterInput,
  ResetPasswordRequest,
  StatusMessageResponse,
  UpdatePasswordRequest,
} from "@/network-calls/types";

/**
 * Club accounts: sign-up, profile, and passwords. Profile writes are
 * multipart (the logo travels with them); authenticated calls take
 * `clubRequestConfig(token)`.
 */

const MULTIPART = { "Content-Type": "multipart/form-data" } as const;

function profileForm(input: ClubProfileInput): FormData {
  const form = new FormData();
  form.append("name", input.name);
  form.append("description", input.description);
  form.append("websiteLink", input.websiteLink);
  form.append("isRecruiting", String(input.isRecruiting));
  for (const label of input.labels) form.append("labels[]", label);
  if (input.logo) form.append("logo", input.logo);
  return form;
}

/** POST /auth/club-register */
export async function postClubRegister(input: ClubRegisterInput): Promise<StatusMessageResponse> {
  const form = profileForm(input);
  form.append("email", input.email);
  form.append("password", input.password);
  form.append("passwordConfirm", input.passwordConfirm);
  const { data } = await apiClient.post<StatusMessageResponse>("/auth/club-register", form, { headers: MULTIPART });
  return data;
}

/** GET /users/getprofile */
export async function fetchClubProfile(config?: RequestConfig): Promise<ClubProfileResponse> {
  const { data } = await apiClient.get<ClubProfileResponse>("/users/getprofile", config);
  return data;
}

/** PUT /users/updateprofile */
export async function putClubProfile(input: ClubProfileInput, config?: RequestConfig): Promise<StatusMessageResponse> {
  const { data } = await apiClient.put<StatusMessageResponse>("/users/updateprofile", profileForm(input), {
    ...config,
    headers: { ...config?.headers, ...MULTIPART },
  });
  return data;
}

/** POST /auth/forgotpassword - emails a reset link. */
export async function postForgotPassword(email: string): Promise<StatusMessageResponse> {
  const { data } = await apiClient.post<StatusMessageResponse>("/auth/forgotpassword", { email });
  return data;
}

/** PATCH /auth/resetpassword/{token} */
export async function patchResetPassword(token: string, body: ResetPasswordRequest): Promise<StatusMessageResponse> {
  const { data } = await apiClient.patch<StatusMessageResponse>(`/auth/resetpassword/${encodeURIComponent(token)}`, body);
  return data;
}

/** POST /users/updatepassword */
export async function postUpdatePassword(body: UpdatePasswordRequest, config?: RequestConfig): Promise<StatusMessageResponse> {
  const { data } = await apiClient.post<StatusMessageResponse>("/users/updatepassword", body, config);
  return data;
}
