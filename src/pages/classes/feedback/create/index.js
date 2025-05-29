import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api';
import useCourseProgress from '../../../../hooks/useCourseProgress'; // 사용자 정의 훅 경로
import ClassFeedbackForm from '../components/FeedbackForm'; // 폼 컴포넌트 경로 (사용자 실제 경로로 수정 필요)
import '../ClassFeedbackPage.css'; // CSS 파일 경로

export default function CreateClassFeedbackPage() {
    const { classId, studentId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const [currentCourseId, setCurrentCourseId] = useState(null);

    const [initialFormValues] = useState({ // 항상 새 폼 기준
        feedbackText: '',
        rating: 5,
        isPublicRequest: false,
        images: [] // MultiImageUploader의 initialFiles용
    });

    const {
        criteriaDataForForm, // 이제 훅에서 직접 가공된 데이터를 받음
        criteriaLoading,
        criteriaError,
        // allCourseCriteria,
        // studentProgress
    } = useCourseProgress(currentCourseId, studentId);

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // 이 useEffect 콜백 함수는 async 함수가 아니므로, await를 직접 사용할 수 없습니다.
        // async 함수를 내부에 정의하고 호출해야 합니다.

        if (!classId || !studentId) {
            setPageError(classId ? "학생 ID가 필요합니다." : "수업 ID가 필요합니다.");
            setPageLoading(false);
            return;
        }

        setPageLoading(true);
        setPageError(null);
        setStudent(null);
        setCurrentCourseId(null);

        // async 함수를 정의하고 즉시 호출 (IIFE) 또는 별도 함수로 정의 후 호출
        const loadPageData = async () => {
            try {
                const [studentRes, classRes] = await Promise.all([
                    api.get(`/api/user/${studentId}`),
                    api.get(`/api/class/${classId}`)
                ]);

                setStudent(studentRes.data);
                const courseIdFromClass = classRes.data?.course_id;

                if (!courseIdFromClass) {
                    console.error("Course ID를 수업 정보에서 찾을 수 없습니다.", classRes.data);
                    throw new Error("수업 정보에서 과정 ID를 가져올 수 없습니다.");
                }
                setCurrentCourseId(courseIdFromClass);

            } catch (err) {
                console.error("피드백 페이지 기본 정보 로딩 중 오류:", err);
                setPageError(err.response?.data?.message || "기본 정보를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setPageLoading(false);
            }
        };
        
        loadPageData(); // 정의된 async 함수 호출

    }, [studentId, classId]);

    const handleSubmit = async (formData, newlySelectedCriterionIds, feedbackImageFiles) => {
        setSubmitting(true);
        setPageError(null);


        try {
            const payload = {
                class_id: Number(classId),
                user_id: Number(studentId),
                feedback_text: formData.feedbackText,
                rating: formData.rating,
                file_keys: feedbackImageFiles ? feedbackImageFiles.map(file => file.file_key).filter(Boolean) : [],
                passed_criterion_ids: newlySelectedCriterionIds || [],
            };

            await api.post(`/api/class-feedbacks`, payload);
            alert('피드백을 저장했습니다.');
            navigate(-1);
        } catch (err) {
            console.error("Failed to submit feedback:", err);
            const errorMessage = err.response?.data?.message || err.message || '저장 중 오류가 발생했습니다.';
            setPageError(errorMessage); // pageError 상태 사용
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    // pageLoading과 criteriaLoading을 합쳐서 전체 로딩 상태 결정
    const isLoading = pageLoading || criteriaLoading;
    // pageError와 criteriaError를 합쳐서 전체 에러 상태 결정
    const displayError = pageError || criteriaError;


    if (isLoading) return <p>로딩 중…</p>;
    if (displayError) return <p>오류: {displayError}</p>;
    if (!student) return <p>학생 정보를 찾을 수 없습니다.</p>; // 로딩 완료 후에도 학생 정보가 없을 경우    

    return (
        <div className="manage-feedback-page">
            <h2>{`피드백 작성 (학생: ${student.name})`}</h2>
            <p>수업 ID: {classId}</p>

            <ClassFeedbackForm
                initialValues={initialFormValues}
                initialCriteriaData={criteriaDataForForm}
                onSubmit={handleSubmit}
                isSubmitting={submitting}
                existingFeedbackId={null}
            />
        </div>
    );
}
