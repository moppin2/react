import React, { useRef, useState, useEffect } from 'react';
import api from '../../services/api'; // ✅ 커스텀 axios 인스턴스
import { useAuth } from '../../hooks/useAuth';

export default function InstructorVeryfy() {
  const [files, setFiles] = useState([]);
  const inputRef = useRef();
  const { user } = useAuth();

  const normalizeFile = (file) => ({
    id: file.id,
    name: file.file_name,
    size: file.size,
    type: file.file_type,
    status: 'done',
    key: file.file_key
  });

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get('/api/upload/list', {
          params: {
            target_type: 'instructor',
            target_id: user.id,
            purpose: 'verification',
          }
        });
        setFiles(res.data.map(normalizeFile));
      } catch (err) {
        console.error('파일 목록 불러오기 실패:', err);
      }
    };

    fetchFiles();
  }, [user.id]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      const tempId = Date.now() + Math.random(); // 중복 방지용 ID
      setFiles((prev) => [...prev, { id: tempId, name: file.name, status: 'uploading' }]);

      try {
        const ext = file.name.split('.').pop();
        const res = await api.post('/api/upload', {
          target_type: 'instructor',
          target_id: user.id,
          purpose: 'verification',
          file_type: file.type,
          extension: ext,
          is_public: false,
        });
        const { presigned_url, file_key } = res.data;

        await api.put(presigned_url, file, {
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          baseURL: ''
        });

        await api.post('/api/upload/record', {
          target_type: 'instructor',
          target_id: user.id,
          purpose: 'verification',
          file_key,
          file_name: file.name,
          file_type: file.type,
          size: file.size,
          is_public: false
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === tempId ? { ...f, status: 'done', key: file_key } : f
          )
        );
      } catch (err) {
        console.error('업로드 실패:', err);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === tempId ? { ...f, status: 'error' } : f
          )
        );
      }
    }

    inputRef.current.value = ''; // 다시 선택 가능하게 초기화
  };

  const handleDownload = async (fileKey) => {
    try {
      const res = await api.get('/api/upload/download-url', {
        params: { file_key: fileKey }
      });
      window.open(res.data.url, '_blank'); // 새 탭에서 열기
    } catch (err) {
      alert('파일 다운로드 실패');
      console.error(err);
    }
  };

  return (
    <div>
      <button onClick={() => inputRef.current.click()}>파일 추가</button>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        multiple
        style={{ display: 'none' }}
      />
      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <button onClick={() => handleDownload(file.key)}>
              {file.name}
            </button>
            {file.status === 'uploading' && <span>⏳</span>}
            {file.status === 'done' && <span>✅</span>}
            {file.status === 'error' && <span>❌</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
