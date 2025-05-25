// src/pages/instructor/feedback/create/index.js (또는 ManageClassFeedbackPage.jsx 등)
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../../services/api'; // api 모듈 경로 (사용자 실제 경로로 수정 필요)
import ClassFeedbackForm from '../components/FeedbackForm'; // 폼 컴포넌트 경로 (사용자 실제 경로로 수정 필요)
import '../ClassFeedbackPage.css';

export default function CreateClassFeedbackPage() {
    const { classId, studentId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [initialFormValues] = useState({ // 항상 새 폼 기준
        feedbackText: '',
        rating: 5,
        isPublicRequest: false,
        images: [] // MultiImageUploader의 initialFiles용
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [allCourseCriteria, setAllCourseCriteria] = useState([]); // 과정의 전체 수료 기준 목록
    const [studentProgress, setStudentProgress] = useState([]);   // 학생이 이미 통과한 기준 정보 목록 ({ criterionId, classId, passed_at, studentName 등 })

    useEffect(() => {
        async function loadInitialDataForFeedback() {
            if (!classId || !studentId) {
                setError(classId ? "학생 ID가 필요합니다." : "수업 ID가 필요합니다.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            setStudent(null); // 이전 데이터 초기화
            setAllCourseCriteria([]); // 이전 데이터 초기화
            setStudentProgress([]);   // 이전 데이터 초기화

            try {
                // Promise.all을 사용하여 학생 정보와 수업 정보를 병렬로 가져올 수 있습니다.
                const [studentRes, classRes] = await Promise.all([
                    api.get(`/api/user/${studentId}`),
                    api.get(`/api/class/${classId}`) // 수업 정보를 가져와 courseId 확보
                ]);

                setStudent(studentRes.data);
                const currentCourseId = classRes.data?.course_id;

                if (!currentCourseId) {
                    console.error("Course ID를 수업 정보에서 찾을 수 없습니다.", classRes.data);
                    // 학생 정보는 로드했으므로 setLoading(false)는 finally에서 처리
                    throw new Error("수업 정보에서 과정 ID를 가져올 수 없습니다.");
                }

                // 이제 courseId를 알았으니, 수료 기준 및 학생의 통과 현황을 가져옵니다.
                // 이 API는 { criteria: [...], studentProgress: [...] } 형태의 객체를 반환한다고 가정합니다.
                const progressStatusRes = await api.get(`/api/course-progress`, {
                    params: {
                        courseId: currentCourseId,
                        studentId: studentId
                    }
                });

                setAllCourseCriteria(progressStatusRes.data.criteria || []);
                setStudentProgress(progressStatusRes.data.studentProgress || []);

            } catch (err) {
                console.error("피드백 페이지 초기 데이터 로딩 중 오류:", err);
                // student 상태는 이미 try 블록 시작 전에 null로 설정되었거나, 위에서 성공적으로 설정되었을 수 있습니다.
                // 에러 발생 시 나머지 데이터 관련 상태도 초기화하는 것이 좋습니다.
                setAllCourseCriteria([]);
                setStudentProgress([]);
                setError(err.response?.data?.message || "정보를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        }

        loadInitialDataForFeedback();
    }, [studentId, classId]); // useEffect 의존성에 classId 추가

    
    console.log('allCourseCriteria: ', allCourseCriteria);
    console.log('studentProgress: ',studentProgress);

    const criteriaDataForForm = useMemo(() => {
        return allCourseCriteria.map(criterion => {
            // studentProgress 배열에서 현재 기준(criterion.id)에 대한 통과 기록을 찾습니다.
            // studentProgress의 각 항목은 { criterionId, classId, passed_at, ... } 형태라고 가정합니다.
            const progressRecord = studentProgress.find(p => p.criterionId === criterion.id);
            return {
                ...criterion, // id, type, value, description 등 CourseCompletionCriteria의 필드
                isAlreadyPassed: !!progressRecord, // 이미 통과했는지 여부
                passedInClassId: progressRecord?.classId, // 어느 수업에서 통과했는지 정보도 필요하면 추가
                passedAt: progressRecord?.passed_at      // 언제 통과했는지 정보도 필요하면 추가
            };
        });
    }, [allCourseCriteria, studentProgress]);

    const handleSubmit = async (formData, newlySelectedCriterionIds, feedbackImageFiles) => {
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                class_id: Number(classId),
                user_id: Number(studentId),
                feedback_text: formData.feedbackText,
                rating: formData.rating,
                file_keys: feedbackImageFiles ? feedbackImageFiles.map(file => file.file_key).filter(Boolean) : [],
                passed_criterion_ids: newlySelectedCriterionIds || [], // 새롭게 통과한 기준 ID 목록 추가
            };

            await api.post(`/api/class-feedbacks`, payload);
            // const savedFeedback = response.data; // 필요하다면 응답 사용

            alert('피드백을 저장했습니다.');
            navigate(-1);
        } catch (err) {
            console.error("Failed to submit feedback:", err);
            const errorMessage = err.response?.data?.message || err.message || '저장 중 오류가 발생했습니다.';
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p>로딩 중…</p>;
    if (error) return <p>오류: {error}</p>;
    if (!student) return <p>학생 정보를 찾을 수 없습니다.</p>;

    return (
        <div className="manage-feedback-page">
            <h2>{`피드백 작성 (학생: ${student.name})`}</h2>
            <p>수업 ID: {classId}</p>

            <ClassFeedbackForm
                initialValues={initialFormValues}
                initialCriteriaData={criteriaDataForForm}
                onSubmit={handleSubmit} // 수정된 handleSubmit 전달
                isSubmitting={submitting}
                existingFeedbackId={null} // 생성 모드
            />
        </div>
    );
}