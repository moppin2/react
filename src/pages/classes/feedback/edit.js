// src/pages/instructor/ClassFeedbackPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import './ClassFeedbackPage.css';
import MultiImageUploader from '../../../components/common/MultiImageUploader'

export default function ClassFeedbackPage() {
    const { classId, studentId } = useParams();
    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [existing, setExisting] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [rating, setRating] = useState(3);
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // const [title, setTitle] = useState('');
    // const [associationCode, setAssociationCode] = useState('');
    // const [levelCode, setLevelCode] = useState('');
    // const [regionCode, setRegionCode] = useState('');
    // const [curriculum, setCurriculum] = useState('');
    // const [description, setDescription] = useState('');
    // const [criteriaList, setCriteriaList] = useState([{ type: '', value: '' }]);
    // const [licenseId, setLicenseId] = useState('');
    // const [coverImageUrl, setCoverImageUrl] = useState('');
    // const [coverImageKey, setCoverImageKey] = useState('');
    // const [galleryImages, setGalleryImages] = useState([]);
    // const [isPublished, setIsPublished] = useState(false); // ✅ 공개 여부

    // const [associationOptions, setAssociationOptions] = useState([]);
    // const [levelOptions, setLevelOptions] = useState([]);
    // const [regionOptions, setRegionOptions] = useState([]);
    // const [licenseOptions, setLicenseOptions] = useState([]);
    const [feedbackImages, setFeedbackImages] = useState([]);
    const initialValues = {};

    useEffect(() => {
        //     setTitle(initialValues?.title || '');
        //     setAssociationCode(initialValues?.license_association || '');
        //     setLicenseId(initialValues?.license_id || '');
        //     setLevelCode(initialValues?.level_code || '');
        //     setRegionCode(initialValues?.region_code || '');
        //     setCurriculum(initialValues?.curriculum || '');
        //     setDescription(initialValues?.description || '');
        //     setCriteriaList(initialValues?.criteriaList || [{ type: '', value: '' }]);
        //     setCoverImageUrl(initialValues?.coverImageUrl || '');
        //     setCoverImageKey(initialValues?.coverImageKey || '');
        //     setGalleryImages(initialValues?.galleryImages || []);
        //     setIsPublished(initialValues?.is_published ?? false); // ✅
    }, [initialValues]);

    useEffect(() => {
        async function load() {
            try {
                // 1) 학생 정보 (이름 등)
                const { data: st } = await api.get(`/api/user/${studentId}`);
                setStudent(st);

                // 2) 기존 피드백이 있으면 불러오기 (수정용)
                const { data: fb } = await api.get(`/api/class-feedbacks`, {
                    params: { class_id: classId, user_id: studentId }
                });
                if (fb.length) {
                    const old = fb[0];
                    setExisting(old);
                    setFeedbackText(old.feedback_text);
                    setRating(old.rating ?? 3);
                    setIsPublic(old.is_public);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [classId, studentId]);

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                class_id: Number(classId),
                user_id: Number(studentId),
                feedback_text: feedbackText,
                rating,
                is_public: isPublic,
            };

            if (existing) {
                // 수정
                await api.put(`/api/class-feedbacks/${existing.id}`, payload);
            } else {
                // 신규 생성
                await api.post(`/api/class-feedbacks`, payload);
            }
            alert('피드백을 저장했습니다.');
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || '저장 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p>로딩 중…</p>;
    if (!student) return <p>학생 정보를 찾을 수 없습니다.</p>;

    return (
        <div className="feedback-page">
            <h2>피드백 남기기</h2>
            <p>수업 #{classId} — 학생: {student.name}</p>
            <MultiImageUploader
                purpose="gallery"
                targetType="feedback"
                targetId={initialValues?.id}
                isPublic={false}
                initialFiles={feedbackImages}
                onUploadedFilesChange={(files) => setFeedbackImages(files)}
            />
            <form onSubmit={handleSubmit} className="feedback-form">
                <label>
                    평점:
                    <select
                        value={rating}
                        onChange={e => setRating(Number(e.target.value))}
                        disabled={submitting}
                    >
                        {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}점</option>
                        ))}
                    </select>
                </label>

                <label>
                    상세 피드백:
                    <textarea
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        rows={6}
                        disabled={submitting}
                        required
                    />
                </label>

                <label className="checkbox">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={e => setIsPublic(e.target.checked)}
                        disabled={submitting}
                    />
                    학생에게 공개 요청하기
                </label>

                <button type="submit" disabled={submitting}>
                    {submitting ? '저장 중…' : existing ? '수정 저장' : '피드백 저장'}
                </button>
            </form>
        </div>
    );
}
