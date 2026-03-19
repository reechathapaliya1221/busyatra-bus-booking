const mongoose = require('mongoose');
const Bus = require('./models/Bus');
const Route = require('./models/Route');
const Schedule = require('./models/Schedule');
require('dotenv').config();

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus_booking');
        
        // Clear existing data
        await Bus.deleteMany({});
        await Route.deleteMany({});
        await Schedule.deleteMany({});
        
        // Create buses with Nepali names
        const bus1 = await Bus.create({
            busNumber: 'NEP101',
            busName: 'सगरमाथा यातायात (Sagarmatha Yatayat)',
            busType: 'AC Sleeper',
            totalSeats: 40,
            amenities: ['WiFi', 'Charging Point', 'Blanket', 'Snacks']
        });
        
        const bus2 = await Bus.create({
            busNumber: 'NEP102',
            busName: 'हिमालयन ट्राभल्स (Himalayan Travels)',
            busType: 'AC Seater',
            totalSeats: 50,
            amenities: ['WiFi', 'Charging Point', 'Movie']
        });
        
        const bus3 = await Bus.create({
            busNumber: 'NEP103',
            busName: 'अन्नपूर्ण डिलक्स (Annapurna Deluxe)',
            busType: 'Non-AC Sleeper',
            totalSeats: 45,
            amenities: ['Charging Point', 'Water Bottle']
        });

        const bus4 = await Bus.create({
            busNumber: 'NEP104',
            busName: 'माछापुच्छ्रे एक्सप्रेस (Machhapuchhre Express)',
            busType: 'AC Sleeper',
            totalSeats: 36,
            amenities: ['WiFi', 'Charging Point', 'Blanket', 'Movie', 'Snacks']
        });

        const bus5 = await Bus.create({
            busNumber: 'NEP105',
            busName: 'लुम्बिनी बुद्ध यातायात (Lumbini Buddha Yatayat)',
            busType: 'AC Seater',
            totalSeats: 42,
            amenities: ['WiFi', 'Charging Point', 'Water Bottle']
        });
        
        console.log('✅ Buses created');
        
        // Create Nepali routes
        const route1 = await Route.create({
            source: 'Kathmandu',
            destination: 'Pokhara',
            distance: 200,
            duration: 420, // 7 hours in minutes
            baseFare: 1200
        });
        
        const route2 = await Route.create({
            source: 'Kathmandu',
            destination: 'Biratnagar',
            distance: 400,
            duration: 540, // 9 hours
            baseFare: 1800
        });
        
        const route3 = await Route.create({
            source: 'Pokhara',
            destination: 'Kathmandu',
            distance: 200,
            duration: 420,
            baseFare: 1200
        });

        const route4 = await Route.create({
            source: 'Kathmandu',
            destination: 'Nepalgunj',
            distance: 550,
            duration: 660, // 11 hours
            baseFare: 2200
        });

        const route5 = await Route.create({
            source: 'Pokhara',
            destination: 'Lumbini',
            distance: 180,
            duration: 300, // 5 hours
            baseFare: 1000
        });

        const route6 = await Route.create({
            source: 'Biratnagar',
            destination: 'Janakpur',
            distance: 120,
            duration: 180, // 3 hours
            baseFare: 600
        });

        const route7 = await Route.create({
            source: 'Kathmandu',
            destination: 'Dharan',
            distance: 350,
            duration: 480, // 8 hours
            baseFare: 1600
        });

        const route8 = await Route.create({
            source: 'Butwal',
            destination: 'Pokhara',
            distance: 130,
            duration: 240, // 4 hours
            baseFare: 700
        });

        const route9 = await Route.create({
            source: 'Nepalgunj',
            destination: 'Dhangadhi',
            distance: 200,
            duration: 300, // 5 hours
            baseFare: 900
        });

        const route10 = await Route.create({
            source: 'Kathmandu',
            destination: 'Janakpur',
            distance: 250,
            duration: 360, // 6 hours
            baseFare: 1300
        });
        
        console.log('✅ Routes created');
        
        // Create schedules for next 7 days
        for (let i = 1; i <= 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            // Morning departure (6 AM)
            const morningDate = new Date(date);
            morningDate.setHours(6, 0, 0, 0);
            const morningArrival = new Date(morningDate);
            morningArrival.setHours(morningDate.getHours() + 7);
            
            // Afternoon departure (2 PM)
            const afternoonDate = new Date(date);
            afternoonDate.setHours(14, 0, 0, 0);
            const afternoonArrival = new Date(afternoonDate);
            afternoonArrival.setHours(afternoonDate.getHours() + 7);
            
            // Evening departure (8 PM)
            const eveningDate = new Date(date);
            eveningDate.setHours(20, 0, 0, 0);
            const eveningArrival = new Date(eveningDate);
            eveningArrival.setHours(eveningDate.getHours() + 7);
            
            // Night departure (11 PM)
            const nightDate = new Date(date);
            nightDate.setHours(23, 0, 0, 0);
            const nightArrival = new Date(nightDate);
            nightArrival.setHours(nightDate.getHours() + 7);
            
            // Create schedules for different routes
            await Schedule.create({
                bus: bus1._id,
                route: route1._id, // Kathmandu → Pokhara
                departureTime: morningDate,
                arrivalTime: morningArrival,
                fare: 1200
            });
            
            await Schedule.create({
                bus: bus2._id,
                route: route1._id, // Kathmandu → Pokhara
                departureTime: afternoonDate,
                arrivalTime: afternoonArrival,
                fare: 1300
            });
            
            await Schedule.create({
                bus: bus3._id,
                route: route2._id, // Kathmandu → Biratnagar
                departureTime: eveningDate,
                arrivalTime: eveningArrival,
                fare: 1800
            });
            
            await Schedule.create({
                bus: bus4._id,
                route: route4._id, // Kathmandu → Nepalgunj
                departureTime: morningDate,
                arrivalTime: new Date(morningDate.getTime() + 11 * 60 * 60 * 1000),
                fare: 2200
            });
            
            await Schedule.create({
                bus: bus5._id,
                route: route5._id, // Pokhara → Lumbini
                departureTime: morningDate,
                arrivalTime: new Date(morningDate.getTime() + 5 * 60 * 60 * 1000),
                fare: 1000
            });
            
            // Add more variety for different days
            if (i % 2 === 0) {
                await Schedule.create({
                    bus: bus1._id,
                    route: route3._id, // Pokhara → Kathmandu
                    departureTime: morningDate,
                    arrivalTime: morningArrival,
                    fare: 1200
                });
                
                await Schedule.create({
                    bus: bus2._id,
                    route: route6._id, // Biratnagar → Janakpur
                    departureTime: afternoonDate,
                    arrivalTime: new Date(afternoonDate.getTime() + 3 * 60 * 60 * 1000),
                    fare: 600
                });
            } else {
                await Schedule.create({
                    bus: bus3._id,
                    route: route7._id, // Kathmandu → Dharan
                    departureTime: nightDate,
                    arrivalTime: new Date(nightDate.getTime() + 8 * 60 * 60 * 1000),
                    fare: 1600
                });
                
                await Schedule.create({
                    bus: bus4._id,
                    route: route8._id, // Butwal → Pokhara
                    departureTime: morningDate,
                    arrivalTime: new Date(morningDate.getTime() + 4 * 60 * 60 * 1000),
                    fare: 700
                });
            }
        }
        
        console.log('✅ Schedules created for the next 7 days');
        console.log('\n📊 Sample data created successfully!');
        console.log('\nनेपाली मार्गहरू (Nepali Routes):');
        console.log('• काठमाडौं → पोखरा (Kathmandu → Pokhara)');
        console.log('• काठमाडौं → विराटनगर (Kathmandu → Biratnagar)');
        console.log('• काठमाडौं → नेपालगञ्ज (Kathmandu → Nepalgunj)');
        console.log('• पोखरा → लुम्बिनी (Pokhara → Lumbini)');
        console.log('• विराटनगर → जनकपुर (Biratnagar → Janakpur)');
        console.log('• बुटवल → पोखरा (Butwal → Pokhara)');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seedData();