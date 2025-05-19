import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { useAuth } from '../../../hooks/useAuth';
import ko from 'date-fns/locale/ko';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../../../services/api';
import './ClassForm.css';

// 한글 로케일 등록
registerLocale('ko', ko);

function ClassForm({ courseId: initialCourseId, initialValues = {}, onSubmit, loading = false }) {

    const { user } = useAuth();
    // 과정 목록
    const [courses, setCourses] = useState([]);
    // 선택된 과정 ID
    const [courseId, setCourseId] = useState(initialValues.course_id || initialCourseId || '');

    // 수업 정보 state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDatetime, setStartDatetime] = useState(null);
    const [endDatetime, setEndDatetime] = useState(null);
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState('');
    const [materials, setMaterials] = useState('');
    const [additionalFees, setAdditionalFees] = useState('');
    const [isReservationClosed, setIsReservationClosed] = useState(false);

    // 수정 모드 초기화: initialValues.id가 있을 때만 실행
    useEffect(() => {
        if (initialValues?.id) {
            setCourseId(initialValues.course_id || initialCourseId || '');
            setTitle(initialValues.title || '');
            setDescription(initialValues.description || '');
            setStartDatetime(initialValues.start_datetime ? new Date(initialValues.start_datetime) : null);
            setEndDatetime(initialValues.end_datetime ? new Date(initialValues.end_datetime) : null);
            setLocation(initialValues.location || '');
            setCapacity(initialValues.capacity?.toString() || '');
            setMaterials(initialValues.materials || '');
            setAdditionalFees(initialValues.additional_fees || '');
            setIsReservationClosed(initialValues.is_reservation_closed ?? false);
        }
    }, [initialValues, initialCourseId]);

    // 과정 목록 조회
    useEffect(() => {
        (async () => {
            try {
                if (user?.id) {
                    api.get(`/api/courses?instructor_id=${user.id}`)
                        .then(res => setCourses(res.data))
                        .catch(err => console.error('과정 목록 조회 실패', err));
                }
            } catch (err) {
                console.error('과정 목록 불러오기 실패:', err);
            }
        })();
    }, [user.id]);

    // 폼 제출 핸들러
    const handleSubmit = e => {
        e.preventDefault();
        if (!courseId) {
            return alert('과정을 선택해주세요.');
        }
        if (!title.trim()) {
            return alert('수업명을 입력해주세요.');
        }
        if (!startDatetime) {
            return alert('시작 일시를 선택해주세요.');
        }
        if (!endDatetime) {
            return alert('종료 일시를 선택해주세요.');
        }
        if (!location.trim()) {
            return alert('장소를 입력해주세요.');
        }
        if (!capacity || parseInt(capacity, 10) <= 0) {
            return alert('정원을 입력해주세요.');
        }
        onSubmit({
            course_id: courseId,
            title,
            description,
            start_datetime: startDatetime?.toISOString() || null,
            end_datetime: endDatetime?.toISOString() || null,
            location,
            capacity: capacity ? parseInt(capacity, 10) : null,
            materials,
            additional_fees: additionalFees,
            is_reservation_closed: isReservationClosed,
        });
    };

    return (
        <form className="class-form" onSubmit={handleSubmit}>
            {/* <h2>수업 정보</h2> */}

            {/* 과정 선택 */}
            <div className="form-group">
                <label>과정 선택</label><select
                    value={courseId}
                    onChange={e => setCourseId(e.target.value)}
                    required
                >
                    <option value="">-- 과정 선택 --</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>
                            {/* 비공개 과정이면 앞에 [비공개] */}
                            {!c.is_published && '[비공개] '}
                            {/* PADI-Freediver 처럼 조합 */}
                            {`${c.license_association} ${c.license_name} - ${c.title}`}
                        </option>
                    ))}
                </select>
            </div>

            {/* 수업명 */}
            <div className="form-group">
                <label>수업명</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                />
            </div>

            {/* 수업 설명 */}
            <div className="form-group">
                <label>수업설명</label>
                <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
            </div>

            {/* 시작·종료 일시 */}
            <div className="form-row">
                <div className="form-group">
                    <label>시작 일시</label>
                    <DatePicker
                        selected={startDatetime}
                        onChange={date => setStartDatetime(date)}
                        locale="ko"
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy년 MM월 dd일 (eee) HH:mm"
                        placeholderText="날짜와 시간을 선택하세요"
                        className="react-datepicker__input-text"
                        required
                        dayClassName={date => {
                            const d = date.getDay();
                            if (d === 0) return 'rdp-day-sunday';
                            if (d === 6) return 'rdp-day-saturday';
                        }}
                    />
                </div>
                <div className="form-group">
                    <label>종료 일시</label>
                    <DatePicker
                        selected={endDatetime}
                        onChange={date => setEndDatetime(date)}
                        locale="ko"
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy년 MM월 dd일 (eee) HH:mm"
                        placeholderText="날짜와 시간을 선택하세요"
                        className="react-datepicker__input-text"
                        required
                        dayClassName={date => {
                            const d = date.getDay();
                            if (d === 0) return 'rdp-day-sunday';
                            if (d === 6) return 'rdp-day-saturday';
                        }}
                    />
                </div>
            </div>

            {/* 장소 */}
            <div className="form-group">
                <label>장소</label>
                <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                />
            </div>

            {/* 정원 */}
            <div className="form-group">
                <label>정원</label>
                <input
                    type="number"
                    min="0"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                />
            </div>

            {/* 준비물 */}
            <div className="form-group">
                <label>준비물</label>
                <textarea
                    rows={3}
                    value={materials}
                    onChange={e => setMaterials(e.target.value)}
                />
            </div>

            {/* 추가 요금 안내 */}
            <div className="form-group">
                <label>추가 요금 안내</label>
                <textarea
                    rows={2}
                    value={additionalFees}
                    onChange={e => setAdditionalFees(e.target.value)}
                />
            </div>

            {/* 예약 마감 */}
            <div className="form-group checkbox-group">
                <label>
                    <input
                        type="checkbox"
                        checked={isReservationClosed}
                        onChange={e => setIsReservationClosed(e.target.checked)}
                    />
                    예약 마감
                </label>
            </div>

            <button type="submit" disabled={loading}>
                {loading ? '저장 중...' : '저장'}
            </button>
        </form>
    );
}

export default ClassForm;
