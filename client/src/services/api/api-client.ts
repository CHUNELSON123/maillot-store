import { API_CONFIG } from "./api-config";
import { ApiError } from "./api-error";

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_CONFIG.baseUrl}${path}`,
    {
      ...fetchOptions,
      headers,
    },
  );

  const contentType = response.headers.get("content-type");

  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data
        ? String(data.message)
        : "An unexpected API error occurred.";

    throw new ApiError(
      message,
      response.status,
      data,
    );
  }

  return data as T;
}
