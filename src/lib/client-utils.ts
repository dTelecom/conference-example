export function generateUUID(): string {
  let d = new Date().getTime();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {

    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);

    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export const setIdentity = (slug: string, identity: string) => {
  sessionStorage.setItem(slug, identity);
};

export const getIdentity = (slug: string) => {
  return sessionStorage.getItem(slug)
}

export const removeIdentity = (slug: string) => {
  sessionStorage.removeItem(slug)
}
