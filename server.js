const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors()); 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ========== הגדרת מודלים ==========

// --- Hotel Model (מעודכן עם מערך תמונות ופרטי בעלים) ---
const hotelSchema = new mongoose.Schema({
    title: String,
    description: String,
    type: String,
    pricePerNight: Number,
    maxGuests: Number,
    location: String,
    images: {
        type: [String],
        default: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'] // תמונת ברירת מחדל
    },
    rating: Number,
    ownerName: String,
    ownerEmail: String,
    ownerPhone: String
});

const Hotel = mongoose.model('Hotel', hotelSchema);

// --- Review Model ---
const reviewSchema = new mongoose.Schema({
    propertyId: { type: String, required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: String,
    userId: { type: String, default: () => 'user_' + Math.random().toString(36).substr(2, 9) }
});

const User = mongoose.model('User', userSchema);

// --- Favorite Model ---
const favoriteSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    propertyId: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
});

favoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
const Favorite = mongoose.model('Favorite', favoriteSchema);

// --- CartItem Model ---
const cartItemSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    propertyId: { type: String, required: true },
    propertyTitle: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    image: { type: String }, // תמונה ראשית לסל
    addedAt: { type: Date, default: Date.now }
});

cartItemSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
const CartItem = mongoose.model('CartItem', cartItemSchema);

// ========== פונקציית Seed מתוקנת ==========
const seedDatabase = async () => {
  try {
    const count = await Hotel.countDocuments();
    console.log(`\n📊 Current number of properties in DB: ${count}`);
    
    // רק אם אין בכלל נכסים - אז נעשה Seed
    if (count === 0) {
        console.log('🌱 Database is empty - starting seed...');
        const propertiesToInsert = [
            { title: 'דירת סטודיו אורבנית', description: 'דירה חמימה במרכז, קרוב להכל.', type: 'apartment', pricePerNight: 350, maxGuests: 2, location: 'ירושלים', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'], rating: 4.5, ownerName: 'משה כהן', ownerEmail: 'moshe@example.com', ownerPhone: '050-1234567' },
            { title: 'דירת גן מרווחת', description: 'דירה עם גינה פרטית שקטה.', type: 'apartment', pricePerNight: 450, maxGuests: 4, location: 'פתח תקווה', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'], rating: 4.2, ownerName: 'שרה לוי', ownerEmail: 'sara@example.com', ownerPhone: '052-7654321' },
            { title: 'פנטהאוז מול הים', description: 'נוף עוצר נשימה בקו ראשון למים.', type: 'apartment', pricePerNight: 850, maxGuests: 6, location: 'אשדוד', images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1515263487990-61b082d69342?w=800'], rating: 4.8, ownerName: 'דוד אברהם', ownerEmail: 'david@example.com', ownerPhone: '054-1112223' },
            { title: 'דירת בוטיק עתיקה', description: 'תקרות גבוהות ועיצוב ירושלמי אותנטי.', type: 'apartment', pricePerNight: 500, maxGuests: 3, location: 'ירושלים', images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800'], rating: 4.7, ownerName: 'רחל אמנו', ownerEmail: 'rachel@example.com', ownerPhone: '050-9988776' },
            { title: 'דירת נופש משפחתית', description: '3 חדרים מאובזרים למשפחה.', type: 'apartment', pricePerNight: 550, maxGuests: 5, location: 'נתניה', images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 'https://images.unsplash.com/photo-1502672023488-70e25813efdf?w=800'], rating: 4.4, ownerName: 'יעקב אבינו', ownerEmail: 'yakov@example.com', ownerPhone: '052-5554433' },
            { title: 'דירת סטודיו מודרנית', description: 'עיצוב נקי ומינימליסטי.', type: 'apartment', pricePerNight: 400, maxGuests: 2, location: 'תל אביב', images: ['https://images.unsplash.com/photo-1536376074432-8d2a3d7f3fb8?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], rating: 4.6, ownerName: 'מיכל ישראלי', ownerEmail: 'michal@example.com', ownerPhone: '053-1122334' },
            { title: 'דירה על יד הכנרת', description: 'מרחק הליכה קצר מהחוף.', type: 'apartment', pricePerNight: 480, maxGuests: 4, location: 'טבריה', images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'], rating: 4.1, ownerName: 'שמעון גלילי', ownerEmail: 'shimon@example.com', ownerPhone: '050-7766554' },
            { title: 'דירת לופט תעשייתית', description: 'חלל פתוח ומעוצב.', type: 'apartment', pricePerNight: 600, maxGuests: 2, location: 'חיפה', images: ['https://images.unsplash.com/photo-1505691938895-1758d7eaa511?w=800'], rating: 4.3, ownerName: 'אבי חיפה', ownerEmail: 'avi@example.com', ownerPhone: '054-6667788' },
            { title: 'יחידת אירוח שקטה', description: 'כניסה נפרדת במושב שקט.', type: 'apartment', pricePerNight: 300, maxGuests: 2, location: 'רעננה', images: ['https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800'], rating: 4.5, ownerName: 'ניר רענני', ownerEmail: 'nir@example.com', ownerPhone: '052-1110099' },
            { title: 'דירת דופלקס יוקרתית', description: 'שתי קומות עם נוף פנורמי.', type: 'apartment', pricePerNight: 900, maxGuests: 6, location: 'הרצליה', images: ['https://images.unsplash.com/photo-1527030280862-64139fba04ca?w=800'], rating: 4.9, ownerName: 'דנה הרצליה', ownerEmail: 'dana@example.com', ownerPhone: '050-4443322' },
            { title: 'צימר עץ מבודד', description: 'שלווה מוחלטת מול נוף הרי הגליל.', type: 'zimmer', pricePerNight: 550, maxGuests: 2, location: 'מירון', images: ['https://images.unsplash.com/photo-1587061949733-7623942dc5c5?w=800'], rating: 4.8, ownerName: 'יוסי מירון', ownerEmail: 'yossi@example.com', ownerPhone: '050-1122334' },
            { title: 'צימר אבן עתיק', description: 'חוויה גלילית אותנטית.', type: 'zimmer', pricePerNight: 600, maxGuests: 2, location: 'צפת', images: ['https://images.unsplash.com/photo-1587061949733-7623942dc5c5?w=800'], rating: 4.7, ownerName: 'חיים צפתי', ownerEmail: 'haim@example.com', ownerPhone: '052-9988112' },
            { title: 'בקתת נופש חמה', description: 'מתאים במיוחד לחורף.', type: 'zimmer', pricePerNight: 580, maxGuests: 3, location: 'בית ג\'ן', images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'], rating: 4.6, ownerName: 'סמיר גן', ownerEmail: 'samir@example.com', ownerPhone: '054-2233445' },
            { title: 'סוויטת צימר יוקרתית', description: 'עיצוב פנים ברמה הגבוהה ביותר.', type: 'zimmer', pricePerNight: 750, maxGuests: 2, location: 'אמירים', images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'], rating: 4.9, ownerName: 'אייל אמירים', ownerEmail: 'eyal@example.com', ownerPhone: '053-5566778' },
            { title: 'צימר עם בריכה פרטית', description: 'פרטיות מלאה בלב הטבע.', type: 'zimmer', pricePerNight: 850, maxGuests: 4, location: 'יבנאל', images: ['https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800'], rating: 4.8, ownerName: 'נועם יבנאל', ownerEmail: 'noam@example.com', ownerPhone: '050-8877665' },
            { title: 'בקתה ביער', description: 'מוקפת עצים ושקט.', type: 'zimmer', pricePerNight: 500, maxGuests: 2, location: 'כרמיאל', images: ['https://images.unsplash.com/photo-1472224311454-d22f1ee16be2?w=800'], rating: 4.4, ownerName: 'אורן יער', ownerEmail: 'oren@example.com', ownerPhone: '052-4433221' },
            { title: 'צימר כפרי למשפחה', description: 'מדשאות רחבות ומשחקים לילדים.', type: 'zimmer', pricePerNight: 650, maxGuests: 5, location: 'מושב רמות', images: ['https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800'], rating: 4.5, ownerName: 'משפחת רמות', ownerEmail: 'ramot@example.com', ownerPhone: '054-9900887' },
            { title: 'סוויטת אבן זוגית', description: 'אווירה רומנטית ושקטה.', type: 'zimmer', pricePerNight: 700, maxGuests: 2, location: 'ראש פינה', images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800'], rating: 4.9, ownerName: 'שולי פינה', ownerEmail: 'shuli@example.com', ownerPhone: '053-7788990' },
            { title: 'צימר בערבה', description: 'חוויה מדברית מיוחדת.', type: 'zimmer', pricePerNight: 450, maxGuests: 3, location: 'צוקים', images: ['https://images.unsplash.com/photo-1509909756405-be0199881695?w=800'], rating: 4.7, ownerName: 'מדבר צוקים', ownerEmail: 'desert@example.com', ownerPhone: '050-6655443' },
            { title: 'בקתה מעוצבת לזוגות', description: 'מינימליזם בלב הטבע.', type: 'zimmer', pricePerNight: 620, maxGuests: 2, location: 'נהריה', images: ['https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800'], rating: 4.6, ownerName: 'גיל נהריה', ownerEmail: 'gil@example.com', ownerPhone: '054-3322110' },
            { title: 'וילה משפחתית ענקית', description: 'וילה עם 5 חדרי שינה וחצר רחבה.', type: 'villa', pricePerNight: 2200, maxGuests: 12, location: 'קיסריה', images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'], rating: 4.7, ownerName: 'רונן קיסר', ownerEmail: 'ronen@example.com', ownerPhone: '050-5544332' },
            { title: 'אחוזת נופש מפוארת', description: 'בריכת ענק וגאקוזי חיצוני.', type: 'villa', pricePerNight: 3500, maxGuests: 15, location: 'סביון', images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'], rating: 5.0, ownerName: 'מיליארדר סביון', ownerEmail: 'rich@example.com', ownerPhone: '052-1111111' },
            { title: 'וילת בוטיק בגליל', description: 'אירוח יוקרתי לקבוצות.', type: 'villa', pricePerNight: 2800, maxGuests: 10, location: 'נוף כנרת', images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'], rating: 4.8, ownerName: 'גליל בוטיק', ownerEmail: 'galil@example.com', ownerPhone: '054-9988776' },
            { title: 'וילה מול המדבר', description: 'שקט מדברי עוצמתי.', type: 'villa', pricePerNight: 1800, maxGuests: 8, location: 'מצפה רמון', images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'], rating: 4.6, ownerName: 'מצפה וילה', ownerEmail: 'mitzpe@example.com', ownerPhone: '050-7766554' },
            { title: 'וילה מעוצבת למסיבות', description: 'חלל אירוח ענק ומערכת שמע.', type: 'villa', pricePerNight: 4000, maxGuests: 20, location: 'ראשון לציון', images: ['https://images.unsplash.com/photo-1549517045-bc93ec074e33?w=800'], rating: 4.5, ownerName: 'פארטי וילה', ownerEmail: 'party@example.com', ownerPhone: '052-4455667' },
            { title: 'וילה כפרית מבודדת', description: 'פרטיות מלאה בלב היער.', type: 'villa', pricePerNight: 2400, maxGuests: 10, location: 'הר אדר', images: ['https://images.unsplash.com/photo-1502301103665-0b95cc738def?w=800'], rating: 4.7, ownerName: 'הר אדר נופש', ownerEmail: 'har@example.com', ownerPhone: '053-2211445' },
            { title: 'וילת יוקרה ליד הים', description: 'צעדים ספורים מהחוף.', type: 'villa', pricePerNight: 3200, maxGuests: 12, location: 'חדרה', images: ['https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800'], rating: 4.9, ownerName: 'ים וילה', ownerEmail: 'sea@example.com', ownerPhone: '050-3344556' },
            { title: 'אחוזת אירוח דרוזית', description: 'אירוח חם ומטבח מסורתי.', type: 'villa', pricePerNight: 2100, maxGuests: 14, location: 'דלית אל כרמל', images: ['https://images.unsplash.com/photo-1494526585095-c41746248156?w=800'], rating: 4.8, ownerName: 'סאלח כרמל', ownerEmail: 'saleh@example.com', ownerPhone: '054-5566778' },
            { title: 'וילה עם חצר ענקית', description: 'מקום מושלם לילדים ולמשפחות.', type: 'villa', pricePerNight: 1950, maxGuests: 12, location: 'רמת השרון', images: ['https://images.unsplash.com/photo-1582063282854-85e85a0927e9?w=800'], rating: 4.4, ownerName: 'רמת וילה', ownerEmail: 'hasharon@example.com', ownerPhone: '052-1122334' },
            { title: 'וילה מודרנית בהרים', description: 'קירות זכוכית ונוף מרהיב.', type: 'villa', pricePerNight: 2600, maxGuests: 8, location: 'בית מאיר', images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'], rating: 4.8, ownerName: 'מאיר הרים', ownerEmail: 'meir@example.com', ownerPhone: '050-8899776' },
            { title: 'סוויטה במלון חמישה כוכבים', description: 'חדר מפואר עם נוף לים.', type: 'hotel', pricePerNight: 950, maxGuests: 2, location: 'נתניה', images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'], rating: 4.9, ownerName: 'מלון רויאל', ownerEmail: 'royal@example.com', ownerPhone: '09-1234567' },
            { title: 'חדר דלוקס אורבני', description: 'במרכז העסקים של העיר.', type: 'hotel', pricePerNight: 700, maxGuests: 2, location: 'תל אביב', images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'], rating: 4.6, ownerName: 'ביזנס הוטל', ownerEmail: 'business@example.com', ownerPhone: '03-9876543' },
            { title: 'סוויטה מלכותית', description: 'פינוק אמיתי בלב ירושלים.', type: 'suite', pricePerNight: 1500, maxGuests: 2, location: 'ירושלים', images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'], rating: 5.0, ownerName: 'קינג דיוויד', ownerEmail: 'king@example.com', ownerPhone: '02-5544332' },
            { title: 'חדר מלון מול הים', description: 'יציאה ישירה לטיילת.', type: 'hotel', pricePerNight: 800, maxGuests: 3, location: 'אילת', images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'], rating: 4.5, ownerName: 'אילת פלאזה', ownerEmail: 'eilat@example.com', ownerPhone: '08-1122334' },
            { title: 'סוויטת ירח דבש', description: 'אווירה רומנטית ויוקרתית.', type: 'suite', pricePerNight: 1100, maxGuests: 2, location: 'טבריה', images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'], rating: 4.8, ownerName: 'לייק סוויט', ownerEmail: 'lake@example.com', ownerPhone: '04-7766554' },
            { title: 'חדר במלון בוטיק', description: 'עיצוב ייחודי ואווירה אינטימית.', type: 'hotel', pricePerNight: 650, maxGuests: 2, location: 'חיפה', images: ['https://images.unsplash.com/photo-1517840901100-8179e982ad93?w=800'], rating: 4.7, ownerName: 'כרמל בוטיק', ownerEmail: 'carmel@example.com', ownerPhone: '04-1112223' },
            { title: 'סוויטה נשיאותית', description: 'הכי טוב שיש למלון להציע.', type: 'suite', pricePerNight: 2500, maxGuests: 4, location: 'תל אביב', images: ['https://images.unsplash.com/photo-1541336032412-2048a678540d?w=800'], rating: 4.9, ownerName: 'הילטון ת"א', ownerEmail: 'hilton@example.com', ownerPhone: '03-5556677' },
            { title: 'חדר מלון קלאסי', description: 'נקי, מסודר וקרוב למרכז.', type: 'hotel', pricePerNight: 500, maxGuests: 2, location: 'באר שבע', images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'], rating: 4.3, ownerName: 'נגב הוטל', ownerEmail: 'negev@example.com', ownerPhone: '08-9988776' },
            { title: 'סוויטת גן במלון', description: 'חדר עם יציאה למדשאה.', type: 'suite', pricePerNight: 850, maxGuests: 4, location: 'ים המלח', images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'], rating: 4.6, ownerName: 'דד סי סוויט', ownerEmail: 'deadsea@example.com', ownerPhone: '08-4433221' },
            { title: 'חדר סופיריור', description: 'מרווח ומאובזר בכל הדרוש.', type: 'hotel', pricePerNight: 600, maxGuests: 2, location: 'אשקלון', images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f24d?w=800'], rating: 4.4, ownerName: 'מרינה הוטל', ownerEmail: 'marina@example.com', ownerPhone: '08-1110099' },
            { title: 'דירת פנטהאוז דה לוקס', description: 'מרפסת ענקית עם גאקוזי.', type: 'apartment', pricePerNight: 1100, maxGuests: 4, location: 'תל אביב', images: ['https://images.unsplash.com/photo-1502672023488-70e25813efdf?w=800'], rating: 4.9, ownerName: 'יוסי פנטהאוז', ownerEmail: 'yossi_p@example.com', ownerPhone: '052-6655443' },
            { title: 'צימר כפרי קטן', description: 'בקתה פשוטה ונעימה.', type: 'zimmer', pricePerNight: 380, maxGuests: 2, location: 'גוש חלב', images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800'], rating: 4.2, ownerName: 'גוש חלב אירוח', ownerEmail: 'gush@example.com', ownerPhone: '054-1122334' },
            { title: 'וילה מודרנית בקיסריה', description: 'למי שמחפש יוקרה אמיתית.', type: 'villa', pricePerNight: 3800, maxGuests: 14, location: 'קיסריה', images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800'], rating: 5.0, ownerName: 'קיסריה וילה', ownerEmail: 'caesarea@example.com', ownerPhone: '050-7788990' },
            { title: 'דירת אירוח ירושלמית', description: 'בלב שכונת נחלאות.', type: 'apartment', pricePerNight: 420, maxGuests: 3, location: 'ירושלים', images: ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'], rating: 4.7, ownerName: 'נחלאות דירות', ownerEmail: 'nachlaot@example.com', ownerPhone: '052-1112223' },
            { title: 'סוויטה במלון מדברי', description: 'חוויה יוקרתית בלב הנגב.', type: 'suite', pricePerNight: 1800, maxGuests: 2, location: 'מצפה רמון', images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'], rating: 4.9, ownerName: 'בראשית דמה', ownerEmail: 'beresheet@example.com', ownerPhone: '08-1112233' },
            { title: 'דירת סטודיו על הים', description: 'מתעוררים לקול הגלים.', type: 'apartment', pricePerNight: 600, maxGuests: 2, location: 'בת ים', images: ['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800'], rating: 4.5, ownerName: 'בת ים נופש', ownerEmail: 'batyam@example.com', ownerPhone: '054-7766554' },
            { title: 'צימר עץ בגולן', description: 'מרחבים ירוקים ושקט.', type: 'zimmer', pricePerNight: 520, maxGuests: 4, location: 'מרום גולן', images: ['https://images.unsplash.com/photo-1475855581690-804d4628733c?w=800'], rating: 4.6, ownerName: 'גולן עץ', ownerEmail: 'golan@example.com', ownerPhone: '050-8877665' },
            { title: 'וילה משפחתית בחיפה', description: 'נוף ליער הכרמל.', type: 'villa', pricePerNight: 1500, maxGuests: 10, location: 'חיפה', images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'], rating: 4.4, ownerName: 'חיפה וילה', ownerEmail: 'haifa_v@example.com', ownerPhone: '052-3344556' },
            { title: 'חדר מלון עסקי', description: 'שירות מהיר ואינטרנט חזק.', type: 'hotel', pricePerNight: 750, maxGuests: 1, location: 'תל אביב', images: ['https://images.unsplash.com/photo-1551882547-ff43c63ef53d?w=800'], rating: 4.6, ownerName: 'ת"א ביזנס', ownerEmail: 'tlv_biz@example.com', ownerPhone: '03-1122334' },
            { title: 'סוויטת גג מדהימה', description: 'הנוף הכי טוב בעיר.', type: 'suite', pricePerNight: 1200, maxGuests: 2, location: 'אילת', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'], rating: 4.8, ownerName: 'רופטופ אילת', ownerEmail: 'rooftop@example.com', ownerPhone: '054-9988776' }
        ];
        
        await Hotel.insertMany(propertiesToInsert);
        console.log(`✅ SUCCESS: ${propertiesToInsert.length} properties inserted into MongoDB!`);
    } else {
        console.log(`✅ Database already has ${count} properties. Skipping seed.`);
        console.log('💡 Tip: If you want to reset the database, use MongoDB Compass or run: db.hotels.deleteMany({})');
    }
  } catch (err) {
    console.error("❌ Seed Error:", err);
  }
};

// ========== חיבור ל-MongoDB ==========
mongoose.connect('mongodb://localhost:27017/hotels_db')
    .then(() => {
        console.log('✅ Connected to MongoDB!');
        seedDatabase(); 
    })
    .catch(err => console.error('❌ Could not connect to MongoDB', err));

// ========== API Endpoints ==========

// --- מלונות ---
app.get('/api/hotels', async (req, res) => {
    try { res.json(await Hotel.find()); } catch (err) { res.status(500).json({ message: err.message }); }
});

app.get('/api/hotels/:id', async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).send('המלון לא נמצא');
        res.json(hotel);
    } catch (err) { res.status(500).json({ message: "ID לא תקין" }); }
});

// --- ביקורות (Reviews) ---
app.get('/api/hotels/reviews/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ propertyId: req.params.propertyId }).sort({ date: -1 });
    res.json(reviews);
  } catch (error) { res.status(500).json({ message: "שגיאה בשליפת הביקורות" }); }
});

app.post('/api/hotels/reviews', async (req, res) => {
  try {
    const newReview = new Review(req.body);
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) { res.status(500).json({ message: "השמירה נכשלה" }); }
});

// --- מועדפים ---
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // אם המשתמש הוא אורח, אל תנסה לחפש ב-DB, פשוט תחזיר מערך ריק
    if (!userId || userId === 'guest') return res.json([]);

    const favorites = await Favorite.find({ userId });
    const propertyIds = favorites.map(f => f.propertyId);
    
    // שליפת המידע המלא על המלונות כדי שיהיה מה להציג ב-FavoritesComponent
    const properties = await Hotel.find({ _id: { $in: propertyIds } });
    
    res.json(properties);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "שגיאה בשליפת המועדפים" });
  }
});

app.post('/api/favorites', async (req, res) => {
    try {
        const { userId, propertyId } = req.body;
        if (!userId || !propertyId) return res.status(400).json({ message: "נתונים חסרים" });

        const exists = await Favorite.findOne({ userId, propertyId });
        if (exists) return res.status(200).json(exists);

        const favorite = new Favorite({ userId, propertyId });
        await favorite.save();
        res.status(201).json(favorite);
    } catch (error) {
        res.status(500).json({ message: "שגיאה בהוספה למועדפים" });
    }
});

app.delete('/api/favorites/:userId/:propertyId', async (req, res) => {
    try {
        const { userId, propertyId } = req.params;
        await Favorite.findOneAndDelete({ userId, propertyId });
        res.json({ message: "הוסר מהמועדפים בהצלחה" });
    } catch (error) {
        res.status(500).json({ message: "הסרה נכשלה" });
    }
});

// --- סל קניות ---
app.get('/api/cart/:userId', async (req, res) => {
  try {
    if (req.params.userId === 'guest') return res.json([]);
    const cartItems = await CartItem.find({ userId: req.params.userId });
    res.json(cartItems);
  } catch (error) { res.status(500).json({ message: "Error fetching cart" }); }
});

app.post('/api/cart', async (req, res) => {
    try {
        const cartItem = new CartItem(req.body);
        await cartItem.save();
        res.status(201).json(cartItem);
    } catch (error) {
        if (error.code === 11000) res.status(200).json({ message: 'Already in cart' });
        else res.status(500).json({ error: 'Failed' });
    }
});

app.delete('/api/cart/:userId', async (req, res) => {
    try {
        await CartItem.deleteMany({ userId: req.params.userId });
        res.json({ message: 'Cart cleared' });
    } catch (error) { res.status(500).json({ error: 'Failed to clear cart' }); }
});

app.delete('/api/cart/:userId/:propertyId', async (req, res) => {
    try {
        await CartItem.deleteOne({ userId: req.params.userId, propertyId: req.params.propertyId });
        res.json({ message: 'Removed' });
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// --- הוספת מלון חדש ---
app.post('/api/hotels', async (req, res) => {
    try {
        const { name, address, type, priceBed, pictures, description } = req.body;

        const newHotel = new Hotel({
            title: name,
            location: address,
            type: type,
            pricePerNight: priceBed,
            // תמיכה בתמונה בודדת או מערך תמונות
            images: Array.isArray(pictures) ? pictures : (pictures ? [pictures] : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800']),
            description: description || "מקום אירוח חדש",
            rating: 5,
            maxGuests: 2,
            ownerName: "אורח"
        });

        const savedHotel = await newHotel.save();
        res.status(201).json(savedHotel);
    } catch (err) {
        console.error("Error adding hotel:", err);
        res.status(500).json({ message: "שגיאה בשמירת המלון" });
    }
});
// --- הרשמה (Signup) ---
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        
        // בדיקה אם המשתמש כבר קיים
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "המייל כבר קיים במערכת" });
        }

        const newUser = new User({ email, password, fullName });
        await newUser.save();
        res.status(201).json({ message: "נרשמת בהצלחה!", user: newUser });
    } catch (err) {
        res.status(500).json({ message: "שגיאה ברישום" });
    }
});

// --- התחברות (Login) ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password }); // בודק התאמה של שניהם

        if (user) {
            // אם נמצא משתמש - מחזירים אותו
            res.json({ message: "התחברת בהצלחה", user });
        } else {
            // אם לא נמצא - שולחים הודעת שגיאה
            res.status(401).json({ message: "אימייל או סיסמה שגויים. יש ליצור חשבון." });
        }
    } catch (err) {
        res.status(500).json({ message: "שגיאה בשרת" });
    }
});
// --- התחברות (Login) ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password }); // בודק התאמה של שניהם

        if (user) {
            // אם נמצא משתמש - מחזירים אותו
            res.json({ message: "התחברת בהצלחה", user });
        } else {
            // אם לא נמצא - שולחים הודעת שגיאה
            res.status(401).json({ message: "אימייל או סיסמה שגויים. יש ליצור חשבון." });
        }
    } catch (err) {
        res.status(500).json({ message: "שגיאה בשרת" });
    }
});
// ========== האזנה לשרת ==========
const port = 3000;
app.listen(port, () => {
    console.log(`\n🚀 Server is running on http://localhost:${port}`);
    console.log(`📊 MongoDB connected to: hotels_db`);
    console.log(`🌐 API available at: http://localhost:${port}/api/hotels\n`);
});