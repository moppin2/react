export async function resizeImage(file, maxWidth = 600) {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const reader = new FileReader();
  
      reader.onload = (e) => {
        img.onload = () => {
          const scale = maxWidth / img.width;
          const width = maxWidth;
          const height = img.height * scale;
  
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
  
          canvas.toBlob((blob) => {
            const resizedFile = new File([blob], file.name, { type: file.type });
            resolve(resizedFile);
          }, file.type, 0.8);
        };
        img.src = e.target.result;
      };
  
      reader.readAsDataURL(file);
    });
  }