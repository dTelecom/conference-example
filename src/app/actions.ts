'use server'

import { cookies } from 'next/headers'

export async function setCookie(name: string, value: string, domain: string) {
  const cookieStore = await cookies()

  const date = new Date();
  date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
  cookieStore.set(name, value, {
    expires: date,
    domain: process.env.NODE_ENV === 'development' ? undefined: extractDomain(domain),
  })
}

export async function getCookie(name: string) {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(name)

  return cookie?.value || null
}
function extractDomain(url: string) {
  return url.replace(/^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/, "$1");
}
