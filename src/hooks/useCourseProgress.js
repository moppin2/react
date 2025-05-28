import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../services/api';

export default function useCourseProgress(courseId, studentId) {
    const [allCourseCriteria, setAllCourseCriteria] = useState([]);
    const [studentProgress, setStudentProgress] = useState([]);
    const [criteriaLoading, setCriteriaLoading] = useState(false);
    const [criteriaError, setCriteriaError] = useState(null);

    const loadCriteriaAndProgress = useCallback(async () => {
        if (!courseId || !studentId) {
            setAllCourseCriteria([]);
            setStudentProgress([]);
            return;
        }

        setCriteriaLoading(true);
        setCriteriaError(null);
        try {
            const progressStatusRes = await api.get(`/api/course-progress`, {
                params: {
                    courseId: courseId,
                    studentId: studentId
                }
            });
            setAllCourseCriteria(progressStatusRes.data.criteria || []);
            setStudentProgress(progressStatusRes.data.studentProgress || []);
        } catch (err) {
            console.error("수료 기준 및 통과 현황 로딩 중 오류:", err);
            setAllCourseCriteria([]);
            setStudentProgress([]);
            setCriteriaError(err.response?.data?.message || "수료 기준 정보를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setCriteriaLoading(false);
        }
    }, [courseId, studentId]);

    useEffect(() => {
        loadCriteriaAndProgress();
    }, [loadCriteriaAndProgress]);

    const criteriaDataForForm = useMemo(() => {
        if (!allCourseCriteria || allCourseCriteria.length === 0) {
            return [];
        }
        return allCourseCriteria.map(criterion => {
            // studentProgress 배열에서 현재 기준(criterion.id)에 대한 통과 기록을 찾습니다.
            // studentProgress의 각 항목(p)에는 criterionId, classId, className, passed_at 등이 포함되어 있습니다.
            const progressRecord = studentProgress.find(p => p.criterionId === criterion.id);

            return {
                // CourseCompletionCriteria에서 오는 정보 (id는 criterion.id와 동일)
                id: criterion.id,
                type: criterion.type,
                value: criterion.value,
                description: criterion.description,
                sort_order: criterion.sort_order,
                course_id: criterion.course_id, // 기준 자체가 속한 course_id

                // 학생의 통과 여부 및 관련 정보
                isAlreadyPassed: !!progressRecord, // 이미 최종 통과했는지 여부
                passedInClassId: progressRecord?.classId || null,       // 통과한 수업 ID
                passedInClassName: progressRecord?.className || null,   // 통과한 수업 이름
                passedAt: progressRecord?.passed_at || null,          // 통과 시점 (StudentCourseProgress의 created_at)
                passedNotes: progressRecord?.notes || null            // 통과 시 남겨진 노트
            };
        });
    }, [allCourseCriteria, studentProgress]);

    return {
        criteriaDataForForm, // 가공된 데이터 직접 반환
        allCourseCriteria,    // 원본 데이터도 필요시 반환 가능 (현재는 criteriaDataForForm만 사용)
        studentProgress,      // 원본 데이터도 필요시 반환 가능
        criteriaLoading,
        criteriaError,
        refreshCriteriaData: loadCriteriaAndProgress
    };
}