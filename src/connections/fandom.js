import { Mwn } from 'mwn';

const bot = Mwn.init({
    apiUrl: process.env.FANDOMAPI,
    username: process.env.FANDOMUSER,
    password: process.env.FANDOMPWD,
    defaultParams: {
        assert: 'user'
    }
});

export { bot };