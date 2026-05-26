/**
 * Triggers a browser file download from string content.
 * Creates a Blob, generates an object URL, triggers download via anchor click, then revokes the URL.
 * @param content - The string content to download
 * @param filename - The filename for the downloaded file
 * @param mimeType - The MIME type of the content (e.g., 'text/csv', 'text/calendar')
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
}
