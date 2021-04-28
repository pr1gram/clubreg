import FingerprintJS from "@fingerprintjs/fingerprintjs";

export const fetchUser = async (): Promise<{ userID: string, userData: {} }> => {

  const fp = await FingerprintJS.load()
  const fingerPrint = await fp.get();

  const data = await fetch(`/api/database/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({action: "fetchUser", fp: fingerPrint.visitorId}),
    credentials: 'include'
  })

  const res = await data.json()

  if (res.logged) return {userID: res.userID, userData: res.userData}
  return {userID: null, userData: {}}

}

export const logout = async (): Promise<{ success: boolean }> => {

  const data = await fetch(`/api/database/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({action: "logout"}),
    credentials: 'include'
  })

  const res = await data.json()

  if (res.status) return {success: true}
  return {success: false}

}