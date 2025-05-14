import React, { useRef, useState, useEffect } from 'react';
import api from '../../services/api';
import { resizeImage } from '../../utils/image';

export default function ImageUploader({
  label,
  purpose,
  targetType,
  targetId,
  initialUrl = '',
  isPublic,
  maxWidth = 600,
  onUploaded = () => {}
}) {
  const inputRef = useRef();
  const [status, setStatus] = useState('idle');
  const [previewUrl, setPreviewUrl] = useState(initialUrl);

  useEffect(() => {
    setPreviewUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (!label || !purpose || !targetType) {
      console.warn('ImageUploader: label, purpose, targetType는 필수 prop입니다.');
    }
  }, [label, purpose, targetType]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('uploading');
    setPreviewUrl('');

    try {
      const ext = file.name.split('.').pop();
      const resized = await resizeImage(file, maxWidth);

      console.log(targetId);

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

      const bucketName = process.env.REACT_APP_S3_BUCKET_NAME;
      const publicUrl = `https://${bucketName}.s3.amazonaws.com/${file_key}`;
      setPreviewUrl(publicUrl);
      setStatus('done');
      onUploaded(publicUrl, file_key);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      setStatus('error');
    } finally {
      inputRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label>{label}</label>}
      <div>
        <button type="button" onClick={() => inputRef.current.click()}>
          이미지 선택
        </button>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      {status === 'uploading' && <p>⏳ 업로드 중...</p>}
      {status === 'error' && <p style={{ color: 'red' }}>❌ 업로드 실패</p>}
      {previewUrl && (
        <div style={{ marginTop: 8 }}>
          <img src={previewUrl} alt="미리보기" style={{ width: 300, borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}
