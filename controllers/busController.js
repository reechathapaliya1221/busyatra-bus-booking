const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');

// Nepali to English city mapping
const nepaliCityMap = {
    'काठमाडौं': 'Kathmandu',
    'पोखरा': 'Pokhara',
    'ललितपुर': 'Lalitpur',
    'भक्तपुर': 'Bhaktapur',
    'विराटनगर': 'Biratnagar',
    'वीरगञ्ज': 'Birgunj',
    'धरान': 'Dharan',
    'जनकपुर': 'Janakpur',
    'भरतपुर': 'Bharatpur',
    'हेटौडा': 'Hetauda',
    'बुटवल': 'Butwal',
    'सिद्धार्थनगर': 'Siddharthanagar',
    'नेपालगञ्ज': 'Nepalgunj',
    'धनगढी': 'Dhangadhi',
    'बिरेन्द्रनगर': 'Birendranagar',
    'गोरखा': 'Gorkha',
    'बन्दीपुर': 'Bandipur',
    'लुम्बिनी': 'Lumbini',
    'मुक्तिनाथ': 'Muktinath',
    'जिरी': 'Jiri',
    'चरिकोट': 'Charikot',
    'दमक': 'Damak',
    'इटहरी': 'Itahari',
    'राजविराज': 'Rajbiraj',
    'गौर': 'Gaur',
    'कलैया': 'Kalaiya',
    'जलेश्वर': 'Jaleshwar',
    'मलेखु': 'Malekhu',
    'मुग्लिन': 'Muglin',
    'नारायणगढ': 'Narayangarh',
    'पथरी': 'Pathari',
    'उर्लाबारी': 'Urlabari',
    'रामेछाप': 'Ramechhap',
    'दोलखा': 'Dolakha',
    'सिन्धुली': 'Sindhuli',
    'बर्दिबास': 'Bardibas',
    'लाहान': 'Lahan',
    'सिराहा': 'Siraha',
    'त्रियुगा': 'Triyuga',
    'इनरुवा': 'Inaruwa',
    'भद्रपुर': 'Bhadrapur',
    'मेचीनगर': 'Mechinagar',
    'बिर्तामोड': 'Birtamod',
    'दमौली': 'Damauli',
    'ब्यास': 'Byas',
    'पुतलीबजार': 'Putalibazar',
    'वालिङ': 'Waling',
    'तानसेन': 'Tansen',
    'रामपुर': 'Rampur',
    'कपिलवस्तु': 'Kapilvastu',
    'तौलिहवा': 'Taulihawa',
    'घोराही': 'Ghorahi',
    'तुल्सीपुर': 'Tulsipur',
    'सल्यान': 'Salyan',
    'जुम्ला': 'Jumla',
    'डोल्पा': 'Dolpa',
    'मनाङ': 'Manang',
    'मुस्ताङ': 'Mustang',
    'लोमान्थाङ': 'Lomanthang',
    'सिमकोट': 'Simkot',
    'गमगढी': 'Gamgadhi',
    'मंगलसेन': 'Mangalsen',
    'डिपायल': 'Dipayal',
    'अमरगढी': 'Amargadhi',
    'दशरथचन्द': 'Dasharathchand',
    'पाटन': 'Patan'
};

// Search buses
const searchBuses = async (req, res) => {
    try {
        let { source, destination, date } = req.query;

        if (!source || !destination || !date) {
            return res.status(400).json({ message: 'Please provide source, destination and date' });
        }

        // Convert Nepali city names to English if needed
        source = nepaliCityMap[source] || source;
        destination = nepaliCityMap[destination] || destination;

        // Find route (case insensitive)
        const route = await Route.findOne({
            source: { $regex: new RegExp(`^${source}$`, 'i') },
            destination: { $regex: new RegExp(`^${destination}$`, 'i') },
            isActive: true
        });

        if (!route) {
            return res.status(404).json({ message: 'No route found for this source and destination' });
        }

        // Create date range for the selected date
        const searchDate = new Date(date);
        const startDate = new Date(searchDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(searchDate);
        endDate.setHours(23, 59, 59, 999);

        // Find schedules
        const schedules = await Schedule.find({
            route: route._id,
            departureTime: { $gte: startDate, $lte: endDate },
            status: 'Scheduled'
        })
        .populate('bus', 'busName busNumber busType totalSeats amenities')
        .populate('route', 'source destination duration baseFare')
        .sort({ departureTime: 1 });

        // Calculate available seats count for each schedule
        const busesWithAvailability = schedules.map(schedule => {
            const availableSeats = schedule.availableSeats.filter(
                seat => seat.isAvailable
            ).length;

            return {
                ...schedule.toObject(),
                availableSeats,
                totalSeats: schedule.bus.totalSeats
            };
        });

        res.json(busesWithAvailability);
    } catch (error) {
        console.error('Search buses error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get bus details
const getBusDetails = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.scheduleId)
            .populate('bus')
            .populate('route');

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.json(schedule);
    } catch (error) {
        console.error('Get bus details error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get seat layout
const getSeatLayout = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.scheduleId)
            .populate('bus', 'busName busType totalSeats');

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        // Organize seats in rows (2+2 configuration)
        const seats = schedule.availableSeats;
        const rows = [];
        const seatsPerRow = 4; // 2 seats on left, 2 on right

        for (let i = 0; i < seats.length; i += seatsPerRow) {
            rows.push(seats.slice(i, i + seatsPerRow));
        }

        res.json({
            busName: schedule.bus.busName,
            busType: schedule.bus.busType,
            rows,
            totalSeats: schedule.bus.totalSeats,
            scheduleId: schedule._id
        });
    } catch (error) {
        console.error('Get seat layout error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    searchBuses,
    getBusDetails,
    getSeatLayout
};