const downloadFile = (file: File, filename = file.name) => {
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);

  a.download = filename;
  a.href = url;
  a.style.position = 'fixed';
  a.style.top = '100%';
  document.body.append(a);
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
};

export const downloadFiles = (files: File[]) => {
  files.forEach((file, index) => {
    setTimeout(() => {
      downloadFile(file);
    }, 100 * index);
  });
};

export default downloadFile;
