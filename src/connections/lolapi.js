import { RiotApi, LolApi } from 'twisted';

const rApi = new RiotApi({
    key: process.env.RIOTAPIKEY
});
const lApi = new LolApi({
    rateLimitRetry: true,
    rateLimitRetryAttempts: 2,
    concurrency: undefined,
    key: process.env.RIOTAPIKEY
});

export { rApi, lApi };