import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/documents');
provider.addScope('https://www.googleapis.com/auth/documents.readonly');
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// Google Drive / Docs API helpers
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export async function listGoogleDocs(accessToken: string): Promise<GoogleDriveFile[]> {
  try {
    const query = encodeURIComponent("mimeType = 'application/vnd.google-apps.document' and trashed = false");
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=20&fields=files(id,name,mimeType,webViewLink,modifiedTime)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to list Google Docs: ${res.status} ${errText}`);
    }
    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Error listing Google Docs:', error);
    throw error;
  }
}

export async function getGoogleDocContent(accessToken: string, documentId: string): Promise<any> {
  try {
    const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to get Google Doc: ${res.status} ${errText}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error getting Google Doc content:', error);
    throw error;
  }
}

export async function createGoogleDoc(accessToken: string, title: string, initialText: string): Promise<{ documentId: string; title: string; webViewLink?: string }> {
  try {
    // 1. Create document
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });
    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Failed to create Google Doc: ${createRes.status} ${errText}`);
    }
    const docData = await createRes.json();
    const documentId = docData.documentId;

    // 2. Insert initial text if provided
    if (initialText) {
      const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                text: initialText,
                endOfSegmentLocation: {}
              }
            }
          ]
        })
      });
      if (!updateRes.ok) {
        console.warn('Document created but failed to insert initial text:', await updateRes.text());
      }
    }

    // 3. Get webViewLink from Drive API
    const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${documentId}?fields=webViewLink`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    let webViewLink = `https://docs.google.com/document/d/${documentId}/edit`;
    if (fileRes.ok) {
      const fileData = await fileRes.json();
      if (fileData.webViewLink) webViewLink = fileData.webViewLink;
    }

    return { documentId, title, webViewLink };
  } catch (error) {
    console.error('Error creating Google Doc:', error);
    throw error;
  }
}
