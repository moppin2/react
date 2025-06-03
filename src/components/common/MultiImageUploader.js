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
  onUploadedFilesChange = () => { }
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

        // 파일 실제 업로드
        await api.put(presigned_url, resized, {
          headers: { 'Content-Type': resized.type },
          baseURL: ''
        });

        const recordRes = await api.post('/api/upload/record', {
          target_type: targetType,
          target_id: targetId,
          purpose,
          file_key,
          file_name: resized.name,
          file_type: resized.type,
          size: resized.size,
          is_public: isPublic,
        });

        // const bucket = process.env.REACT_APP_S3_BUCKET_NAME;
        // const url = `https://${bucket}.s3.amazonaws.com/${file_key}`;

        // recordRes.data에 file_key와 함께 표시용 url이 포함되어 있다고 가정
        // 예: { file_key: '...', url: '...', ... }
        if (recordRes.data && recordRes.data.url) {
          newFiles.push({
            file_key: recordRes.data.file_key, // 백엔드에서 file_key를 다시 받을 수도 있음
            url: recordRes.data.url // 백엔드가 제공한 표시용 URL 사용
          });
        } else {
          // 백엔드 응답에 URL이 없는 경우의 대체 처리 (오류 또는 기본 public URL)
          console.warn('표시용 URL을 백엔드로부터 받지 못했습니다. Public URL로 대체합니다.');
          const bucket = process.env.REACT_APP_S3_BUCKET_NAME;
          const fallbackUrl = `https://${bucket}.s3.amazonaws.com/${file_key}`;
          newFiles.push({ file_key, url: fallbackUrl });
        }
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
