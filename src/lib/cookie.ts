export async function setCrossSubdomainCookie(name: string, value: string) {

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies()

  const date = new Date();
  date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
  cookieStore.set(name, value, {
    expires: date,
    path: '/',
    domain: extractDomain(window.location.origin),
  })
}

export const getCrossSubdomainCookie = async (name: string) => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies()
  const cookie = cookieStore.get(name);
  return null;
}

function extractDomain(url: string) {
  return url.replace(/^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/, "$1");
}
