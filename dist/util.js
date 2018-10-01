"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function sleep(delay) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), delay);
    });
}
exports.sleep = sleep;
// export async function doGet(uri: string): Promise<any> {
//     return new Promise((resolve, reject) => {
//         let req = http.get(uri);
//         req.on('response', res => {
//             let rawData = '';
//             res.on('data', (chunk: string) => { rawData += chunk; });
//             res.on('end', () => {
//                 resolve(rawData);
//             });
//         });
//         req.on('error', err => {
//             resolve("");
//         });
//     });
// }
//# sourceMappingURL=util.js.map