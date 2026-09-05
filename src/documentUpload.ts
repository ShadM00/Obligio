import type {DocumentPickerResponse} from '@react-native-documents/picker';
import type {Id} from '../convex/_generated/dataModel';

/**
 * Uploads a picked local file to a Convex-generated upload URL.
 *
 * Convex expects the raw bytes as the request body, not a multipart envelope,
 * so the local `file://` URI is read into a Blob first. Passing React Native's
 * `{uri, type, name}` descriptor straight to `fetch` only works as a FormData
 * part, and would otherwise store the descriptor rather than the document.
 */
export async function uploadPickedDocument(
  uploadUrl: string,
  file: DocumentPickerResponse,
): Promise<Id<'_storage'>> {
  if (!file.uri) throw new Error('The selected document has no readable URI.');

  const localRead = await fetch(file.uri);
  if (!localRead.ok) throw new Error(`Could not read the selected document (${localRead.status}).`);
  const blob = await localRead.blob();

  const contentType = file.type ?? blob.type ?? 'application/octet-stream';
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {'Content-Type': contentType},
    body: blob,
  });
  if (!response.ok) throw new Error(`Document upload failed (${response.status}).`);

  const body = (await response.json()) as {storageId?: Id<'_storage'>};
  if (!body.storageId) throw new Error('The upload response did not include a storage ID.');
  return body.storageId;
}
