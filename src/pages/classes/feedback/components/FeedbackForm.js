import React, { useState, useEffect } from 'react';
import MultiImageUploader from '../../../../components/common/MultiImageUploader'; // 실제 경로로 수정해주세요
import './ClassFeedbackForm.css'; // 실제 CSS 파일 경로로 수정해주세요

export default function ClassFeedbackForm({
    initialValues = { 
        feedbackText: '', 
        rating: 5, 
        images: [],
        // 수정 모드일 때, 이 피드백을 통해 "최초 통과"로 기록될 예정이었던 기준 ID 목록
        // 이 정보는 EditFeedbackPage에서, StudentCourseProgress 기록 중 notes 필드나
        // 혹은 ClassFeedback에 임시 저장된 passed_criterion_ids 등을 파싱하여 전달해야 할 수 있습니다.
        // 또는, 이 피드백이 이미 저장되어 StudentCourseProgress를 만들었다면,
        // 그 Progress 기록 중 현재 class_id와 매칭되는 것들을 가져와야 합니다.
        // 이 prop은 "이전에 이 피드백 저장 시 선택했던, 아직 isAlreadyPassed가 아니었던 기준들"을 의미할 수 있습니다.
        initiallySelectedCriteriaForThisFeedback: [] 
    },
    initialCriteriaData = [], // [{ id, type, value, ..., isAlreadyPassed, passedInClassId, passedInClassName }, ...]
    onSubmit, 
    isSubmitting,
    existingFeedbackId,
    classIdForDisplay, // 현재 피드백이 작성되고 있는 class의 ID (부모로부터 받아야 함)
    // studentNameForDisplay,
}) {
    const [feedbackText, setFeedbackText] = useState('');
    const [rating, setRating] = useState(5);
    const [feedbackImages, setFeedbackImages] = useState([]);
    const [newlyPassedCriterionIds, setNewlyPassedCriterionIds] = useState(new Set());

    useEffect(() => {
        setFeedbackText(initialValues.feedbackText || '');
        setRating(initialValues.rating ?? 5);
        setFeedbackImages(initialValues.images || []);
        
        const initialSelections = new Set();
        if (initialCriteriaData.length > 0) {
            initialCriteriaData.forEach(criterion => {
                // Case 1: 이미 이 수업에서 통과된 것으로 기록된 기준 (isAlreadyPassed = true, passedInClassId matches)
                // 이 기준은 초기에 체크되어야 하고, 수정(해제) 가능해야 합니다.
                if (criterion.isAlreadyPassed && criterion.passedInClassId === Number(classIdForDisplay)) {
                    initialSelections.add(criterion.id);
                }
                // Case 2: 아직 전체적으로 통과되지 않았지만 (isAlreadyPassed = false),
                // 이전에 이 피드백에서 선택되었던 기준 (수정 모드에서 initialValues로 전달된 경우)
                // 이 부분은 initialValues.initiallySelectedCriteriaForThisFeedback를 활용해야 합니다.
                // 현재는 이 prop이 "이전에 이 피드백으로 통과시킨 ID 목록"을 정확히 담고 있다고 가정합니다.
                else if (!criterion.isAlreadyPassed && initialValues.initiallySelectedCriteriaForThisFeedback?.includes(criterion.id)) {
                     initialSelections.add(criterion.id);
                }
            });
        }
        setNewlyPassedCriterionIds(initialSelections);

    }, [initialValues, initialCriteriaData, existingFeedbackId, classIdForDisplay]);

    const handleCriteriaChange = (criterionId) => {
        setNewlyPassedCriterionIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(criterionId)) {
                newIds.delete(criterionId);
            } else {
                newIds.add(criterionId);
            }
            return newIds;
        });
    };

    const internalHandleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        onSubmit(
            { feedbackText, rating },
            Array.from(newlyPassedCriterionIds),
            feedbackImages
        );
    };

    const ratings = [1, 2, 3, 4, 5];

    return (
        <div className="feedback-form-container">
            {/* ... 제목, 이미지 업로더, 평점, 상세 피드백 UI ... */}
            <MultiImageUploader
                purpose="gallery"
                targetType="feedback"
                targetId={existingFeedbackId}
                isPublic={false}
                initialFiles={feedbackImages}
                onUploadedFilesChange={(files) => setFeedbackImages(files)}
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

                {initialCriteriaData && initialCriteriaData.length > 0 && (
                    <fieldset className="criteria-fieldset" disabled={isSubmitting}>
                        <legend>수료 기준 통과 여부 (이번 수업에서)</legend>
                        {initialCriteriaData.map(criterion => {
                            // 이 기준이 "과정 전체에서" 이미 최종 통과되었는지 여부
                            const isPassedOverall = criterion.isAlreadyPassed;
                            // 그 통과가 "이번 수업에서" 이루어졌는지 여부
                            const passedInThisClass = isPassedOverall && criterion.passedInClassId === Number(classIdForDisplay);
                            
                            // 체크박스의 checked 상태 결정:
                            // 1. 다른 수업에서 이미 최종 통과: 항상 체크 (그리고 비활성화됨)
                            // 2. 이번 수업에서 통과되었거나, 또는 아직 통과 안했지만 이번에 새로 선택: newlyPassedCriterionIds에 따라 결정
                            const isChecked = (isPassedOverall && !passedInThisClass) || newlyPassedCriterionIds.has(criterion.id);

                            // 체크박스의 disabled 상태 결정:
                            // 1. 다른 수업에서 이미 최종 통과: 수정 불가
                            // 2. 또는 폼 제출 중일 때
                            const isDisabled = (isPassedOverall && !passedInThisClass) || isSubmitting;

                            return (
                                <div key={criterion.id} className="criteria-item">
                                    <label htmlFor={`criterion-${criterion.id}`} className="checkbox-label criteria-label">
                                        <input
                                            type="checkbox"
                                            id={`criterion-${criterion.id}`}
                                            checked={isChecked}
                                            disabled={isDisabled}
                                            onChange={() => handleCriteriaChange(criterion.id)}
                                        />
                                        {criterion.type} - {criterion.value}
                                        {criterion.description && ` (${criterion.description})`}
                                        {isPassedOverall && 
                                            <span className="already-passed-badge">
                                                (이미 통과{criterion.passedInClassName ? ` - ${criterion.passedInClassName}` : ''}
                                                {passedInThisClass ? ' / 이번 수업에서 확인됨' : ''})
                                            </span>
                                        }
                                    </label>
                                </div>
                            );
                        })}
                    </fieldset>
                )}
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '저장 중…' : (existingFeedbackId ? '수정 저장' : '피드백 저장')}
                </button>
            </form>
        </div>
    );
}
