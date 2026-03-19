const fs = require('fs');
const path = require('path');

console.log('=== CHECKING ALL ROUTES ===\n');

const routesDir = path.join(__dirname, 'routes');
const routeFiles = fs.readdirSync(routesDir);

routeFiles.forEach(file => {
    if (file.endsWith('.js')) {
        console.log(`\n--- Checking ${file} ---`);
        try {
            const route = require(`./routes/${file}`);
            console.log(`✅ ${file} loaded successfully`);
        } catch (error) {
            console.log(`❌ Error loading ${file}:`, error.message);
            if (error.stack) {
                const lines = error.stack.split('\n');
                console.log('First few lines of stack:');
                lines.slice(0, 3).forEach(line => console.log(line));
            }
        }
    }
});

console.log('\n=== CHECKING CONTROLLERS ===\n');

const controllersDir = path.join(__dirname, 'controllers');
const controllerFiles = fs.readdirSync(controllersDir);

controllerFiles.forEach(file => {
    if (file.endsWith('.js')) {
        try {
            const controller = require(`./controllers/${file}`);
            const exports = Object.keys(controller);
            console.log(`✅ ${file}: exports →`, exports.join(', '));
        } catch (error) {
            console.log(`❌ ${file}: Error -`, error.message);
        }
    }
});

console.log('\n=== CHECKING MIDDLEWARE ===\n');

const middlewareDir = path.join(__dirname, 'middleware');
if (fs.existsSync(middlewareDir)) {
    const middlewareFiles = fs.readdirSync(middlewareDir);
    middlewareFiles.forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const middleware = require(`./middleware/${file}`);
                const exports = Object.keys(middleware);
                console.log(`✅ ${file}: exports →`, exports.join(', '));
            } catch (error) {
                console.log(`❌ ${file}: Error -`, error.message);
            }
        }
    });
} else {
    console.log('❌ middleware directory not found!');
}