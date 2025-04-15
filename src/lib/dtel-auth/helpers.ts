export const formatUserId = (userId: string | null) => {
  if (!userId) {
    return null;
  }
  return userId.replace("did:privy:", "");
}
