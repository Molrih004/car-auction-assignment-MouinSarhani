import { serviceProxy } from './serviceProxy.js';

export const AUCTIONS_PATHS = ['/auctions'];

export const auctionsProxy = serviceProxy('auction-service', process.env.AUCTION_SERVICE_URL || 'http://localhost:4002', AUCTIONS_PATHS);
