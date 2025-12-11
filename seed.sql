-- 지자체 샘플 데이터
INSERT OR IGNORE INTO municipalities (name_ko, name_en, name_zh, name_ja, name_vi, name_mn, name_ru, region, contact_email) VALUES 
  ('서울특별시', 'Seoul', '首尔特别市', 'ソウル特別市', 'Thành phố Seoul', 'Сөүл', 'Сеул', 'seoul', 'seoul@example.com'),
  ('부산광역시', 'Busan', '釜山广域市', '釜山広域市', 'Thành phố Busan', 'Пусан', 'Пусан', 'busan', 'busan@example.com'),
  ('인천광역시', 'Incheon', '仁川广域市', '仁川広域市', 'Thành phố Incheon', 'Инчон', 'Инчхон', 'incheon', 'incheon@example.com');

-- 일자리 카테고리 샘플 데이터
INSERT OR IGNORE INTO job_categories (name_ko, name_en, name_zh, name_ja, name_vi, name_mn, name_ru, icon) VALUES 
  ('사무행정', 'Office Administration', '办公行政', '事務管理', 'Hành chính văn phòng', 'Албан хэрэг', 'Офисное администрирование', 'briefcase'),
  ('서비스', 'Service', '服务业', 'サービス', 'Dịch vụ', 'Үйлчилгээ', 'Обслуживание', 'users'),
  ('생산제조', 'Manufacturing', '生产制造', '製造', 'Sản xuất', 'Үйлдвэрлэл', 'Производство', 'industry'),
  ('교육', 'Education', '教育', '教育', 'Giáo dục', 'Боловсрол', 'Образование', 'graduation-cap'),
  ('보건의료', 'Healthcare', '医疗保健', '医療', 'Chăm sóc sức khỏe', 'Эрүүл мэнд', 'Здравоохранение', 'heartbeat'),
  ('돌봄', 'Care Services', '护理服务', 'ケアサービス', 'Dịch vụ chăm sóc', 'Асрамжийн үйлчилгээ', 'Услуги по уходу', 'heart');

-- 사용자 샘플 데이터
INSERT OR IGNORE INTO users (email, name, phone, birth_year, gender, user_type, municipality_id, preferred_language) VALUES 
  ('senior1@example.com', '김영희', '010-1234-5678', 1955, 'female', 'senior', 1, 'ko'),
  ('senior2@example.com', '이철수', '010-2345-6789', 1960, 'male', 'senior', 1, 'ko'),
  ('female1@example.com', 'Sarah Kim', '010-3456-7890', 1985, 'female', 'female', 2, 'en'),
  ('disabled1@example.com', '박민수', '010-4567-8901', 1990, 'male', 'disabled', 3, 'ko');

-- 일자리 샘플 데이터
INSERT OR IGNORE INTO jobs (
  title_ko, title_en, title_zh, title_ja, title_vi, title_mn, title_ru,
  description_ko, description_en, description_zh, description_ja, description_vi, description_mn, description_ru,
  category_id, municipality_id, company_name, location, 
  salary_min, salary_max, employment_type, work_hours, target_type, status
) VALUES 
  (
    '노인복지관 사무보조', 'Senior Center Office Assistant', '老人福利馆办公助理', '高齢者福祉館事務補助', 'Trợ lý văn phòng trung tâm người cao tuổi', 'Ахмадын төвийн албан хэргийн туслах', 'Помощник в центре для пожилых',
    '서류 정리, 전화 응대, 방문객 안내 등 사무 업무 지원', 'Document organization, phone reception, visitor guidance', '文件整理、电话接待、访客引导', '書類整理、電話対応、来客案内', 'Sắp xếp tài liệu, tiếp nhận điện thoại, hướng dẫn khách', 'Баримт бичиг цэгцлэх, утасны хүлээн авалт', 'Организация документов, прием звонков',
    1, 1, '서울노인복지관', '서울시 강남구',
    2000000, 2500000, 'part-time', '09:00-15:00', 'senior', 'active'
  ),
  (
    '카페 서빙 직원', 'Cafe Server', '咖啡厅服务员', 'カフェサーバー', 'Nhân viên phục vụ quán cà phê', 'Кафегийн үйлчлэгч', 'Официант в кафе',
    '고객 서비스, 주문 받기, 음료 서빙', 'Customer service, order taking, beverage serving', '客户服务、点餐、饮料服务', '接客、注文受付、ドリンクサービング', 'Dịch vụ khách hàng, nhận đơn hàng', 'Үйлчлүүлэгчийн үйлчилгээ', 'Обслуживание клиентов',
    2, 1, '스타벅스 서울점', '서울시 종로구',
    2200000, 2800000, 'part-time', '10:00-16:00', 'female', 'active'
  ),
  (
    '제품 포장 작업', 'Product Packaging', '产品包装', '製品包装', 'Đóng gói sản phẩm', 'Бүтээгдэхүүн савлах', 'Упаковка продукции',
    '제품 검수 및 포장, 간단한 작업', 'Product inspection and packaging', '产品检验和包装', '製品検査と包装', 'Kiểm tra và đóng gói sản phẩm', 'Бүтээгдэхүүн шалгах, савлах', 'Проверка и упаковка',
    3, 2, '부산제조', '부산시 해운대구',
    2100000, 2600000, 'full-time', '09:00-18:00', 'disabled', 'active'
  ),
  (
    '학습지도 보조교사', 'Teaching Assistant', '学习辅导助理', '学習指導補助教師', 'Trợ giảng hướng dẫn học tập', 'Суралцагчийн туслах багш', 'Помощник преподавателя',
    '초등학생 학습 지도 보조, 숙제 확인', 'Elementary student tutoring assistance', '小学生学习辅导', '小学生学習指導', 'Hỗ trợ dạy học sinh tiểu học', 'Бага сургуулийн суралцагчдад туслах', 'Помощь в обучении школьников',
    4, 3, '인천교육지원센터', '인천시 남동구',
    2300000, 3000000, 'part-time', '14:00-18:00', 'female', 'active'
  ),
  (
    '요양보호사', 'Caregiver', '护理员', '介護福祉士', 'Nhân viên chăm sóc', 'Асаргааны ажилтан', 'Сиделка',
    '노인 돌봄 및 생활 지원', 'Elderly care and daily living support', '老人护理和生活支持', '高齢者ケアと生活支援', 'Chăm sóc người già và hỗ trợ sinh hoạt', 'Ахмад настныг асарч хамгаалах', 'Уход за пожилыми',
    6, 1, '서울요양원', '서울시 마포구',
    2500000, 3200000, 'full-time', '09:00-18:00', 'all', 'active'
  );
