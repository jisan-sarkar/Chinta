export function getOAuthCallbackError(search: string) {
  const params = new URLSearchParams(search);
  const error =
    params.get("error_description") ??
    params.get("error") ??
    params.get("message");

  if (!error) {
    return undefined;
  }

  return `Google sign-in failed: ${error.replaceAll("+", " ")}`;
}
