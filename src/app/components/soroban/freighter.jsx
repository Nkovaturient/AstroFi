import { requestAccess, setAllowed, signTransaction } from "@stellar/freighter-api";

async function checkConnection() {
  try {
    const isAllowed = await setAllowed();
    return !!isAllowed;
  } catch (error) {
    console.error("[checkConnection Error]:", error);
    return false;
  }
}

async function retrievePublicKey() {
  try {
    const publicKey = await requestAccess();
    return publicKey;
  } catch (error) {
    console.error("[retrievePublicKey Error]:", error);
    return null;
  }
}

async function userSignTransaction(xdr, network, signWith) {
  try {
    const signedTx = await signTransaction(xdr, {
      network,
      accountToSign: signWith,
    });
    return signedTx;
  } catch (error) {
    console.error("[userSignTransaction Error]:", error);
    return null;
  }
}

export { checkConnection, retrievePublicKey, userSignTransaction };
