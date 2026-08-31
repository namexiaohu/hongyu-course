export function displayNameFromUser(firstName?: string, lastName?: string) {
  return `${firstName ?? ''} ${lastName ?? ''}`.trim();
}
