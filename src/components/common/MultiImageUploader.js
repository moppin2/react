import React, { useRef, useState, useEffect } from 'react';
import api from '../../services/api';
import { resizeImage } from '../../utils/image';

export default function MultiImageUploader({
  purpose,
  targetType,
  targetId,
  isPublic,
  maxWidth = 1000,
  initialFiles = [], // [{ file_key, url }]
  onUploadedFilesChange = () => {}
}) {
  const inputRef = useRef();
  const [files, setFiles] = useState(initialFiles);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
  setFiles(initialFiles);
}, [initialFiles]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    setUploading(true);

    const newFiles = [];

    for (const file of selectedFiles) {
      try {
        const ext = file.name.split('.').pop().toLowerCase();
        const resized = await resizeImage(file, maxWidth);

        const presignRes = await api.post('/api/upload', {
          target_type: targetType,
          target_id: targetId,
          purpose,
          file_type: resized.type,
          extension: ext,
          is_public: isPublic,
        });

        const { presigned_url, file_key } = presignRes.data;

        await api.put(presigned_url, resized, {
          headers: { 'Content-Type': resized.type },
          baseURL: ''
        });

        await api.post('/api/upload/record', {
          target_type: targetType,
          target_id: targetId,
          purpose,
          file_key,
          file_name: resized.name,
          file_type: resized.type,
          size: resized.size,
          is_public: isPublic,
        });

        const bucket = process.env.REACT_APP_S3_BUCKET_NAME;
        const url = `https://${bucket}.s3.amazonaws.com/${file_key}`;

        newFiles.push({ file_key, url });
      } catch (err) {
        console.error('파일 업로드 실패:', err);
      }
    }

    const updated = [...files, ...newFiles];
    setFiles(updated);
    onUploadedFilesChange(updated);
    inputRef.current.value = '';
    setUploading(false);
  };

  const handleRemove = (key) => {
    const updated = files.filter(f => f.file_key !== key);
    setFiles(updated);
    onUploadedFilesChange(updated);
  };

  return (
    <div className="multi-image-upload">
      <label>추가 이미지</label>
      <div>
        <button type="button" onClick={() => inputRef.current.click()} disabled={uploading}>
          이미지 선택
        </button>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={inputRef}
          onChange={handleFileChange}
        />
      </div>

      {uploading && <p>⏳ 업로드 중...</p>}

      <div>
        {files.map((f) => (
          <div key={f.file_key}>
            <img
              src={f.url}
              alt="업로드 이미지"
            />
            <button
              type="button"
              onClick={() => handleRemove(f.file_key)}
              
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
