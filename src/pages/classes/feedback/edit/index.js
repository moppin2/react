// src/pages/instructor/feedback/edit/index.js (또는 사용자의 실제 경로에 맞게 수정)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api'; // API 서비스 파일 경로 (실제 경로로 수정 필요)
import FeedbackForm from '../components/FeedbackForm'; // 폼 컴포넌트 경로 (실제 경로로 수정 필요)
import useCourseProgress from '../../../../hooks/useCourseProgress'; // 커스텀 훅 경로
// import '../ClassFeedbackPage.css'; // 필요하다면 CSS 파일 경로

export default function EditFeedbackPage() {
    const { feedbackId } = useParams(); // URL에서 feedbackId 가져오기
    const navigate = useNavigate();

    const [initialFormValues, setInitialFormValues] = useState(null); // 폼 초기값 (로딩 전 null)
    const [studentName, setStudentName] = useState(''); // 표시용 학생 이름
    const [classIdForDisplay, setClassIdForDisplay] = useState(''); // 표시용 수업 ID
    
    const [pageLoading, setPageLoading] = useState(true); // 페이지 기본 정보 로딩 상태
    const [submitting, setSubmitting] = useState(false);
    const [pageError, setPageError] = useState(null); // 페이지 기본 정보 에러 상태

    // --- 수료 기준 로딩을 위한 상태 ---
    const [currentCourseId, setCurrentCourseId] = useState(null);
    const [currentStudentIdForHook, setCurrentStudentIdForHook] = useState(null);

    const {
        criteriaDataForForm,
        criteriaLoading,
        criteriaError,
        // allCourseCriteria,
        // studentProgress
    } = useCourseProgress(currentCourseId, currentStudentIdForHook);

    // 기존 피드백 데이터 및 관련 정보를 불러오는 함수
    const loadFeedbackForEdit = useCallback(async () => {
        setPageLoading(true);
        setPageError(null);
        setCurrentCourseId(null); // 초기화
        setCurrentStudentIdForHook(null); // 초기화

        try {
            const feedbackRes = await api.get(`/api/class-feedbacks/${feedbackId}`);
            const feedbackData = feedbackRes.data; 
            console.log(feedbackData);
            // feedbackData.class_id

            if (!feedbackData) {
                throw new Error('피드백 정보를 찾을 수 없습니다.');
            }

            if (feedbackData.is_publication_requested !== null) {
                alert('임시 저장 상태의 피드백만 수정할 수 있습니다.');
                navigate(-1);
                return;
            }

            setClassIdForDisplay(feedbackData.class_id || feedbackData.class?.id);
            setStudentName(feedbackData.user?.name || '알 수 없는 학생');
            
            // courseId와 studentId를 상태에 설정하여 useCourseProgress 훅이 실행되도록 함
            // feedbackData.class.course.id 또는 feedbackData.course_id 등으로 courseId를 가져와야 함
            // feedbackData.user.id 또는 feedbackData.user_id로 studentId를 가져와야 함
            const courseIdFromFeedback = feedbackData.class?.course_id || feedbackData.course_id; // API 응답 구조에 따라
            const studentIdFromFeedback = feedbackData.user_id || feedbackData.user?.id;

            if (!courseIdFromFeedback || !studentIdFromFeedback) {
                throw new Error("피드백 데이터에서 과정 ID 또는 학생 ID를 찾을 수 없습니다.");
            }
            setCurrentCourseId(courseIdFromFeedback);
            setCurrentStudentIdForHook(studentIdFromFeedback);


            setInitialFormValues({
                feedbackText: feedbackData.feedback_text || '',
                rating: feedbackData.rating ?? 5,
                isPublicRequest: false, // 수정 시에는 이 값은 폼에서 직접 관리하지 않음 (별도 액션)
                images: feedbackData.images || []
            });

        } catch (err) {
            console.error("Failed to load feedback for editing:", err);
            setPageError(err.response?.data?.message || "피드백 정보를 불러오는 중 오류가 발생했습니다.");
            setInitialFormValues(null);
        } finally {
            setPageLoading(false); // 페이지 기본 정보 로딩 완료
        }
    }, [feedbackId, navigate]);

    useEffect(() => {
        if (feedbackId) {
            loadFeedbackForEdit();
        } else {
            setPageError("잘못된 접근입니다: 피드백 ID가 없습니다.");
            setPageLoading(false);
        }
    }, [feedbackId, loadFeedbackForEdit]);

    // 폼 제출 핸들러 (피드백 업데이트)
    const handleSubmit = async (formData, newlySelectedCriterionIds, uploadedImageList) => {
        if (!feedbackId) {
            alert("수정할 피드백 ID가 올바르지 않습니다.");
            return;
        }

        setSubmitting(true);
        setPageError(null); // 이전 에러 초기화

        try {
            const payload = {
                feedback_text: formData.feedbackText,
                rating: formData.rating,
                file_keys: uploadedImageList ? uploadedImageList.map(file => file.file_key).filter(Boolean) : [],
                passed_criterion_ids: newlySelectedCriterionIds || [], // 새롭게 통과(또는 이번에 선택)한 기준 ID 목록
                // is_publication_requested 관련 정보는 이 API에서 직접 변경하지 않음
            };

            await api.put(`/api/class-feedbacks/${feedbackId}`, payload);

            alert('피드백이 성공적으로 수정되었습니다.');
            navigate(-1); 

        } catch (err) {
            console.error('피드백 수정 실패:', err);
            const errorMessage = err.response?.data?.message || err.message || '피드백 수정 중 오류가 발생했습니다.';
            setPageError(errorMessage);
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // 전체 로딩 상태: 페이지 기본 정보 로딩 중이거나, 수료 기준 정보 로딩 중일 때
    const isLoading = pageLoading || criteriaLoading;
    // 전체 에러 상태: 페이지 기본 정보 에러 또는 수료 기준 정보 에러
    const displayError = pageError || criteriaError;

    if (isLoading) return <p>피드백 정보를 불러오는 중…</p>;
    if (submitting) return <p>피드백을 저장하는 중…</p>;
    if (displayError) return <p>오류: {displayError}</p>;
    if (!initialFormValues) return <p>피드백을 찾을 수 없거나 현재 수정할 수 없는 상태입니다.</p>;

    return (
        <div className="edit-feedback-page-container">
            <FeedbackForm
                initialValues={initialFormValues}
                initialCriteriaData={criteriaDataForForm} // 커스텀 훅에서 가져온 가공된 데이터 전달
                onSubmit={handleSubmit}
                isSubmitting={submitting}
                existingFeedbackId={Number(feedbackId)}
                classIdForDisplay={classIdForDisplay}
                studentNameForDisplay={studentName}
            />
        </div>
    );
}
