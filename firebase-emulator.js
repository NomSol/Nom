const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create firebase.json configuration file if it doesn't exist
const createFirebaseConfig = () => {
    const configPath = path.join(process.cwd(), 'firebase.json');

    if (!fs.existsSync(configPath)) {
        console.log('Creating firebase.json configuration...');
        const config = {
            "database": {
                "rules": "database.rules.json"
            },
            "emulators": {
                "database": {
                    "port": 9000
                },
                "ui": {
                    "enabled": true,
                    "port": 9001
                }
            }
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('firebase.json created');
    }

    // Create empty database rules if they don't exist
    const rulesPath = path.join(process.cwd(), 'database.rules.json');
    if (!fs.existsSync(rulesPath)) {
        console.log('Creating database.rules.json...');
        const rules = {
            "rules": {
                ".read": true,
                ".write": true
            }
        };

        fs.writeFileSync(rulesPath, JSON.stringify(rules, null, 2));
        console.log('database.rules.json created');
    }
};

// Start Firebase emulator
const startEmulator = () => {
    console.log('Starting Firebase emulator...');

    // Create necessary config files first
    createFirebaseConfig();

    // Start the emulator
    const emulator = spawn('npx', ['firebase', 'emulators:start', '--only', 'database']);

    // Handle emulator output
    emulator.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);

        // If emulator is ready, run the seed script
        if (output.includes('All emulators ready')) {
            console.log('Emulator ready, running seed script...');
            const seeder = spawn('node', ['firebase-seed.js']);

            seeder.stdout.on('data', (data) => {
                console.log(data.toString());
            });

            seeder.stderr.on('data', (data) => {
                console.error(`Seed error: ${data}`);
            });

            seeder.on('close', (code) => {
                console.log(`Seed script exited with code ${code}`);
                // Don't exit the emulator to allow manual inspection
                console.log('Keep the emulator running for inspection. Press Ctrl+C to exit.');
            });
        }
    });

    emulator.stderr.on('data', (data) => {
        console.error(`Emulator error: ${data}`);
    });

    emulator.on('close', (code) => {
        console.log(`Emulator process exited with code ${code}`);
    });

    // Handle process termination
    process.on('SIGINT', () => {
        console.log('Caught interrupt signal, shutting down...');
        emulator.kill();
        process.exit(0);
    });
};

// Run the emulator
startEmulator(); 