import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function InstructorVeryfy() {
  const { id } = useParams();
  const [files, setFiles] = useState([]);
  const [targetInstructor, setTargetInstructor] = useState();
  const [history, setHistory] = useState([]);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectReasonInput, setShowRejectReasonInput] = useState(false);
  const inputRef = useRef();
  const { user } = useAuth();
  const navigate = useNavigate();

  const targetInstructorId = user.userType === 'admin' ? id : user.id;
  const isEditable =
    user.userType === 'instructor' &&
    ['draft', 'rejected'].includes(targetInstructor?.status);

  const normalizeFile = (file) => ({
    id: file.id,
    name: file.file_name,
    size: file.size,
    type: file.file_type,
    status: 'done',
    key: file.file_key
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fileRes, historyRes] = await Promise.all([
          api.get('/api/verifyfile/list', {
            params: {
              target_type: 'instructor',
              target_id: targetInstructorId,
              purpose: 'verification',
            },
          }),
          api.get(`/api/instructor/${targetInstructorId}/history`),
        ]);
        setFiles(fileRes.data.map(normalizeFile));
        setHistory(historyRes.data);
      } catch (err) {
        console.error('파일 또는 이력 불러오기 실패:', err);
      }
    };
    fetchData();
  }, [user.id, targetInstructorId]);

  useEffect(() => {
    const fetchInstructor = async () => {
      if (user.userType === 'admin') {
        try {
          const res = await api.get(`/api/instructor/${targetInstructorId}`);
          setTargetInstructor({
            username: res.data.name,
            status: res.data.status,
          });
        } catch (err) {
          console.error('강사 정보 불러오기 실패:', err);
        }
      } else {
        setTargetInstructor({
          username: user.username,
          status: user.status,
        });
      }
    };
    fetchInstructor();
  }, [user, targetInstructorId]);

  const handleFileChange = async (e) => {
    if (!isEditable) return;
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      const tempId = Date.now() + Math.random();
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
          baseURL: '',
        });

        await api.post('/api/upload/record', {
          target_type: 'instructor',
          target_id: user.id,
          purpose: 'verification',
          file_key,
          file_name: file.name,
          file_type: file.type,
          size: file.size,
          is_public: false,
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

    inputRef.current.value = '';
  };

  const handleDownload = async (fileKey) => {
    try {
      const res = await api.get('/api/download/presigned-url', {
        params: { file_key: fileKey },
      });
      window.open(res.data.url, '_blank');
    } catch (err) {
      alert('파일 다운로드 실패');
      console.error(err);
    }
  };

  const handleRemoveFile = (idToRemove) => {
    if (!isEditable) return;
    setFiles((prev) => prev.filter((file) => file.id !== idToRemove));
  };

  const handleTempSave = async () => {
    const completedFiles = files.filter((file) => file.status === 'done');
    try {
      await api.post('/api/instructor/verify/temp-save', {
        instructor_id: targetInstructorId,
        file_keys: completedFiles.map((file) => file.key),
      });
      alert('임시 저장이 완료되었습니다.');
    } catch (err) {
      console.error('임시 저장 실패:', err);
      alert('임시 저장 중 오류가 발생했습니다.');
    }
  };

  const handleSubmit = async () => {
    const completedFiles = files.filter((file) => file.status === 'done');
    try {
      await api.post('/api/instructor/verify/submit', {
        instructor_id: targetInstructorId,
        file_keys: completedFiles.map((file) => file.key),
      });
      alert('제출이 완료되었습니다.');
      navigate('/');
    } catch (err) {
      console.error('제출 실패:', err);
      alert('제출 중 오류가 발생했습니다.');
    }
  };

  const handleApprove = async () => {
    try {
      await api.patch(`/api/instructor/${targetInstructorId}/status`, {
        status: 'approved',
      });
      alert('승인 완료');
      navigate('/');
    } catch (err) {
      console.error('승인 실패:', err);
      alert('승인 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('반려 사유를 입력해주세요.');
      return;
    }
    try {
      await api.patch(`/api/instructor/${targetInstructorId}/status`, {
        status: 'rejected',
        reason: rejectReason,
      });
      alert('반려 완료');
      navigate('/');
    } catch (err) {
      console.error('반려 실패:', err);
      alert('반려 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="content-basic">
      <h3>{targetInstructor?.username}님의 가입신청 문서</h3>

      {isEditable && (
        <>
          <button onClick={() => inputRef.current.click()}>파일 추가</button>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            multiple
            style={{ display: 'none' }}
          />
        </>
      )}

      <ul>
        {files.map((file) => (
          <li key={file.id}>
            <button onClick={() => handleDownload(file.key)}>{file.name}</button>
            {file.status === 'uploading' && <span> ⏳</span>}
            {file.status === 'done' && <span> ✅</span>}
            {file.status === 'error' && <span> ❌</span>}
            {isEditable && (
              <button
                onClick={() => handleRemoveFile(file.id)}
                style={{ marginLeft: '10px', color: 'red' }}
                aria-label="파일 제거"
              >
                ✖
              </button>
            )}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '16px' }}>
        {isEditable && (
          <>
            <button onClick={handleTempSave}>임시 저장</button>
            <button onClick={handleSubmit} style={{ marginLeft: '10px' }}>제출</button>
          </>
        )}

        {user.userType === 'admin' && targetInstructor?.status === 'submitted' && (
          <div style={{ marginTop: '20px' }}>
            <button onClick={handleApprove}>승인</button>
            <button onClick={() => setShowRejectReasonInput(true)} style={{ marginLeft: '10px' }}>
              반려
            </button>

            {showRejectReasonInput && (
              <div style={{ marginTop: '10px' }}>
                <textarea
                  placeholder="반려 사유를 입력하세요"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  style={{ width: '100%' }}
                />
                <button onClick={handleReject} style={{ marginTop: '5px' }}>반려 확정</button>
              </div>
            )}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h4>심사 이력</h4>
          <ul>
            {history.map((h) => (
              <li key={h.id}>
                [{h.action}] {h.performer_type} #{h.performed_by} - {h.reason || '사유 없음'} ({new Date(h.created_at).toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
