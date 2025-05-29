import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api'; // 실제 API 서비스 경로로 수정
import { useAuth } from '../../../../hooks/useAuth'; // 실제 useAuth 훅 경로로 수정
import ReviewForm from '../components/ReviewForm'; // 실제 ReviewForm 컴포넌트 경로로 수정

export default function WriteReviewPage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // 현재 로그인한 학생 정보

    const [classInfo, setClassInfo] = useState(null); // 수업 정보
    const [existingReview, setExistingReview] = useState(null); // 학생의 기존 리뷰 (수정 시)
    const [initialFormValues, setInitialFormValues] = useState(null); // 폼 초기값

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const loadInitialData = useCallback(async () => {
        if (!classId || !user || !user.id) {
            setError("수업 ID 또는 사용자 정보가 유효하지 않습니다.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // 1. 수업 정보 가져오기 (수업 이름 등 표시용)
            const classRes = await api.get(`/api/class/${classId}`); // 백엔드에 해당 API 필요
            setClassInfo(classRes.data);

            // 2. 현재 학생이 이 수업에 대해 이미 작성한 리뷰가 있는지 확인
            // API 예: GET /api/classes/:classId/my-review (로그인한 유저 기준)
            try {
                const reviewRes = await api.get(`/api/classes/${classId}/my-review`);
                if (reviewRes.data && reviewRes.data.id) { // 리뷰 데이터가 있고 id도 있는지 확인
                    setExistingReview(reviewRes.data);
                    setInitialFormValues({
                        rating: reviewRes.data.rating || 5,
                        reviewText: reviewRes.data.review_text || '',
                        isPublic: reviewRes.data.is_public || false,
                        images: reviewRes.data.images || [] // 리뷰에도 이미지가 있다면
                    });
                } else {
                    setInitialFormValues({ rating: 5, reviewText: '', isPublic: false, images: [] });
                }
            } catch (reviewErr) {
                if (reviewErr.response && reviewErr.response.status === 404) {
                    // 기존 리뷰가 없으면 404, 이는 에러가 아님 (새로 작성)
                    setInitialFormValues({ rating: 5, reviewText: '', isPublic: false, images: [] });
                } else {
                    console.error("기존 리뷰 로딩 중 오류:", reviewErr);
                    // 다른 종류의 에러는 상위 catch에서 처리되도록 하거나 여기서 별도 처리
                    throw reviewErr; 
                }
            }

        } catch (err) {
            console.error("리뷰 작성 페이지 데이터 로딩 중 오류:", err);
            setError(err.response?.data?.message || "정보를 불러오는 중 오류가 발생했습니다.");
            setInitialFormValues({ rating: 5, reviewText: '', isPublic: false, images: [] }); // 에러 시에도 폼은 기본값으로
        } finally {
            setLoading(false);
        }
    }, [classId, user]); // user 객체가 변경되면 (로그인/아웃) 다시 로드

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    const handleSubmit = async (formData, reviewImageFiles) => {
        if (!user || !user.id) {
            alert("로그인이 필요합니다.");
            return;
        }
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                class_id: Number(classId),
                rating: formData.rating,
                review_text: formData.reviewText,
                is_public: formData.isPublic,
                file_keys: reviewImageFiles ? reviewImageFiles.map(file => file.file_key).filter(Boolean) : [],
            };

            if (existingReview && existingReview.id) {
                // 리뷰 수정
                await api.put(`/api/class-reviews/${existingReview.id}`, payload);
                alert('리뷰가 성공적으로 수정되었습니다.');
            } else {
                // 새 리뷰 생성
                await api.post(`/api/class-reviews`, payload);
                alert('리뷰가 성공적으로 작성되었습니다.');
            }
            navigate(-1); // 또는 후기 목록 페이지 등으로 이동

        } catch (err) {
            console.error("Failed to submit review:", err);
            const errorMessage = err.response?.data?.message || err.message || '리뷰 저장 중 오류가 발생했습니다.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p>페이지 로딩 중…</p>;
    if (error) return <p>오류: {error}</p>;
    // classInfo나 initialFormValues가 로드되지 않았을 경우를 대비
    if (!classInfo || !initialFormValues) return <p>수업 정보를 불러오지 못했거나 폼 초기화에 실패했습니다.</p>;

    return (
        <div className="write-review-page"> {/* CSS 클래스명은 실제 파일과 일치 */}
            <h1>{classInfo.title || `수업 (ID: ${classId})`}</h1>
            <h2>후기 {existingReview ? '수정' : '작성'}</h2>
            <p>작성자: {user?.username || '학생'}</p>
            
            <ReviewForm
                initialValues={initialFormValues}
                onSubmit={handleSubmit}
                isSubmitting={submitting}
                existingReviewId={existingReview?.id || null}
            />
        </div>
    );
}