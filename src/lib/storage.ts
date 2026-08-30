export async function uploadFile(file: File, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: reader.result,
            fileName: file.name,
            path
          })
        });
        const data = await res.json();
        if (res.ok && data.success && data.url) {
          resolve(data.url);
        } else {
          resolve(reader.result as string);
        }
      } catch (e) {
        resolve(reader.result as string);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
