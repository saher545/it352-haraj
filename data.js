'use strict';

const listings = [
  { id: 'camry', type: 'cars', city: 'riyadh', price: 62500, offers: [59500, 58000, 56500], image: 'camry', 
    title: ['تويوتا كامري GLE 2021', '2021 Toyota Camry GLE'],
    summary: ['كامري GLE موديل 2021، بحالة جيدة وصيانتها منتظمة. الممشى ٨٤ ألف كم.', '2021 Camry GLE in good condition with regular maintenance. Mileage: 84,000 km.'],
    specs: [['سنة الصنع','Model year','2021','2021'], ['الممشى','Mileage','٨٤٬٠٠٠ كم','84,000 km'], ['ناقل الحركة','Transmission','أوتوماتيك','Automatic'], ['اللون','Colour','أبيض','White']] },
  { id: 'wheels', type: 'parts', city: 'jeddah', price: 1650, image: 'wheels',
    title: ['طقم جنوط كامري ١٧ بوصة', 'Camry 17-inch wheel set'],
    summary: ['طقم من أربع جنوط مستعملة مع الإطارات. تحقق من التوافق قبل الشراء.', 'Set of four used wheels with tyres. Check fitment before buying.'],
    specs: [['المقاس','Size','١٧ بوصة','17 inches'], ['الكمية','Quantity','٤ قطع','4 pieces'], ['التوافق','Fitment','تويوتا كامري','Toyota Camry'], ['الحالة','Condition','مستعمل','Used']] },
  { id: 'camera', type: 'electronics', city: 'riyadh', price: 2300, image: 'camera',
    title: ['كاميرا رقمية مع عدسة', 'Digital camera with lens'],
    summary: ['كاميرا رقمية مستعملة مع عدسة تصوير وبطارية وشاحن.', 'Used digital camera with a lens, battery and charger.'],
    specs: [['النوع','Type','بدون مرآة','Mirrorless'], ['الملحقات','Accessories','بطارية وشاحن','Battery and charger'], ['الحالة','Condition','مستعمل','Used']] },
  { id: 'elantra', type: 'cars', city: 'dammam', price: 42750, offers: [41250, 40600], image: 'elantra',
    title: ['هيونداي إلنترا 2020', '2020 Hyundai Elantra'],
    summary: ['إلنترا مستعملة بمواصفات أساسية وناقل حركة أوتوماتيك.', 'Used Elantra with standard equipment and automatic transmission.'],
    specs: [['سنة الصنع','Model year','2020','2020'], ['الممشى','Mileage','١٠٢٬٠٠٠ كم','102,000 km'], ['ناقل الحركة','Transmission','أوتوماتيك','Automatic'], ['اللون','Colour','فضي','Silver']] },
  { id: 'lights', type: 'parts', city: 'riyadh', price: 920, image: 'lights',
    title: ['زوج مصابيح LED أمامية', 'Pair of LED headlamps'],
    summary: ['مصباحان أماميان للسيارة. تحقق من المقاس والتوافق قبل الشراء.', 'Two front headlamps. Check size and fitment before buying.'],
    specs: [['التقنية','Technology','LED','LED'], ['الكمية','Quantity','قطعتان','Two pieces'], ['الحالة','Condition','مستعمل','Used']] },
  { id: 'sofa', type: 'furniture', city: 'jeddah', price: 1250, image: 'sofa',
    title: ['أريكة قماش بثلاثة مقاعد', 'Three-seat fabric sofa'],
    summary: ['أريكة قماشية بلون بيج، بعرض ٢٢٠ سم، متاحة للاستلام في جدة.', 'Beige fabric sofa, 220 cm wide, available for pickup in Jeddah.'],
    specs: [['العرض','Width','٢٢٠ سم','220 cm'], ['اللون','Colour','بيج','Beige'], ['الحالة','Condition','مستعمل','Used']] }
];

const categories = {
  cars: { label: ['سيارات','Cars'], icon: 'car' },
  parts: { label: ['قطع غيار','Car parts'], icon: 'wrench' },
  electronics: { label: ['إلكترونيات','Electronics'], icon: 'camera' },
  furniture: { label: ['أثاث','Furniture'], icon: 'sofa' }
};
const cities = { riyadh: ['الرياض','Riyadh'], jeddah: ['جدة','Jeddah'], dammam: ['الدمام','Dammam'] };
