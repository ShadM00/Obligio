import type {DocumentPickerResponse} from '@react-native-documents/picker';

/** Uploads a picked local file to a Convex-generated upload URL. */
export async function uploadPickedDocument(uploadUrl: string, file: DocumentPickerResponse) {
  if (!file.uri) throw new Error('The selected document has no readable URI.');
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {'Content-Type': file.type ?? 'application/octet-stream'},
    body: {uri: file.uri, type: file.type ?? 'application/octet-stream', name: file.name ?? 'document'},
  } as RequestInit);
  if (!response.ok) throw new Error(`Document upload failed (${response.status}).`);
  const body = await response.json() as {storageId?: string};
  if (!body.storageId) throw new Error('The upload response did not include a storage ID.');
  return body.storageId;
}
