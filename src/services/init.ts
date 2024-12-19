import { LocationCleanupService } from './location-cleanup';

export function initializeServices() {
    //location cleanup schedule (runs every 120 minutes)
    LocationCleanupService.startCleanupSchedule(120);
}