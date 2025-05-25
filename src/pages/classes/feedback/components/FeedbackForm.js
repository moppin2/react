// src/components/feedback/ClassFeedbackForm.jsx (또는 사용자님의 파일 경로)
import React, { useState, useEffect } from 'react';
import MultiImageUploader from '../../../../components/common/MultiImageUploader'; // 경로 확인 및 수정 필요
import './ClassFeedbackForm.css';

export default function ClassFeedbackForm({
    initialValues = { feedbackText: '', rating: 5, images: [] },
    onSubmit,
    isSubmitting,
    existingFeedbackId,
}) {
    const [feedbackText, setFeedbackText] = useState('');
    const [rating, setRating] = useState(5);
    const [feedbackImages, setFeedbackImages] = useState([]);

    useEffect(() => {
        setFeedbackText(initialValues.feedbackText || '');
        setRating(initialValues.rating ?? 3);
        // initialValues.images는 부모로부터 받은 기존 파일 정보 (MultiImageUploader가 이해하는 형식)
        setFeedbackImages(initialValues.images || []);
    }, [initialValues]);

    const internalHandleSubmit = (e) => {
        e.preventDefault();
        // 폼 데이터와 함께 feedbackImages 배열 전체를 부모로 전달
        onSubmit({
            feedbackText,
            rating,
        }, feedbackImages); // feedbackImages는 [{ file_key: '...', url: '...', name: '...' }, ...] 형태
    };

    const ratings = [1, 2, 3, 4, 5];

    return (
        <div className="feedback-form-container">
            <MultiImageUploader
                purpose="gallery"
                targetType="feedback"
                targetId={existingFeedbackId}
                isPublic={false}
                initialFiles={feedbackImages} // 기존 파일 목록 또는 새로 업로드되어 추가된 파일 목록
                onUploadedFilesChange={(files) => setFeedbackImages(files)} // 업로드/삭제 시 files 배열로 상태 업데이트
            />
            <form onSubmit={internalHandleSubmit} className="feedback-form">
                <fieldset disabled={isSubmitting} className="rating-fieldset">
                    <legend>평점:</legend>
                    <div className="radio-group">
                        {ratings.map(rValue => (
                            <label htmlFor={`rating-${rValue}`} key={rValue} className="radio-label">
                                <input
                                    type="radio"
                                    id={`rating-${rValue}`}
                                    name="rating"
                                    value={rValue}
                                    checked={rating === rValue}
                                    onChange={() => setRating(rValue)}
                                />
                                {rValue}점
                            </label>
                        ))}
                    </div>
                </fieldset>

                <label htmlFor="feedbackText-input">
                    상세 피드백:
                    <textarea
                        id="feedbackText-input"
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        rows={6}
                        disabled={isSubmitting}
                        required
                    />
                </label>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '저장 중…' : (existingFeedbackId ? '수정 저장' : '피드백 저장')}
                </button>
            </form>
        </div>
    );
}