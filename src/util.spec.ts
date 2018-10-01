import 'mocha';
import { sleep } from './util';
describe('util', async () => {
    it("sleep", async () => {
        await sleep(100)
    });
});