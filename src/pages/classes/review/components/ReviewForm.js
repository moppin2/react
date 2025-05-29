
import React, { useState, useEffect } from 'react'; // 이미 WriteReviewPage에 있음
import MultiImageUploader from '../../../../components/common/MultiImageUploader'; // 필요시 주석 해제
import './ReviewForm.css'; // 필요시 CSS 파일

export default function ReviewForm({
    initialValues = { rating: 3, reviewText: '', isPublic: false, images: [] },
    onSubmit,
    isSubmitting,
    existingReviewId // 수정 모드인지 판단하기 위함
}) {
    const [rating, setRating] = useState(initialValues.rating ?? 5);
    const [reviewText, setReviewText] = useState(initialValues.reviewText || '');
    const [isPublic, setIsPublic] = useState(initialValues.isPublic || false);
    const [reviewImages, setReviewImages] = useState(initialValues.images || []);

    useEffect(() => {
        setRating(initialValues.rating ?? 3);
        setReviewText(initialValues.reviewText || '');
        setIsPublic(initialValues.isPublic || false);
        setReviewImages(initialValues.images || []);
    }, [initialValues]);

    const internalHandleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        onSubmit(
            { rating, reviewText, isPublic }, // 폼 데이터
            reviewImages                      // 이미지 파일 목록
        );
    };

    const ratings = [1, 2, 3, 4, 5];

    return (
        <div className="review-form-container"> {/* CSS는 ClassFeedbackForm과 유사하게 적용 가능 */}
            {/* 리뷰에도 이미지 업로더가 필요하다면 MultiImageUploader 추가 */}
            <MultiImageUploader
                purpose="gallery" // 또는 'review_image'
                targetType="review" // UploadFile 테이블의 target_type
                targetId={existingReviewId} // 수정 시에만 review ID 전달
                isPublic={isPublic} // 리뷰의 공개 여부를 따를 수 있음
                initialFiles={reviewImages}
                onUploadedFilesChange={(files) => setReviewImages(files)}
            />

            <form onSubmit={internalHandleSubmit} className="review-form">
                <fieldset disabled={isSubmitting} className="rating-fieldset">
                    <legend>수업 만족도:</legend>
                    <div className="radio-group">
                        {ratings.map(rValue => (
                            <label htmlFor={`review-rating-${rValue}`} key={rValue} className="radio-label">
                                <input
                                    type="radio"
                                    id={`review-rating-${rValue}`}
                                    name="review-rating"
                                    value={rValue}
                                    checked={rating === rValue}
                                    onChange={() => setRating(rValue)}
                                />
                                {rValue}점
                            </label>
                        ))}
                    </div>
                </fieldset>

                <label htmlFor="reviewText-input">
                    수업 후기:
                    <textarea
                        id="reviewText-input"
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        rows={8}
                        placeholder="수업에 대한 솔직한 후기를 남겨주세요."
                        disabled={isSubmitting}
                        required
                    />
                </label>

                <label className="checkbox-label" htmlFor="isPublic-checkbox">
                    <input
                        type="checkbox"
                        id="isPublic-checkbox"
                        checked={isPublic}
                        onChange={e => setIsPublic(e.target.checked)}
                        disabled={isSubmitting}
                    />
                    이 후기를 다른 사람들에게 공개합니다.
                </label>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '저장 중…' : (existingReviewId ? '후기 수정' : '후기 작성')}
                </button>
            </form>
        </div>
    );
}