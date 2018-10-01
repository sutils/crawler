import * as http from 'http';

export function sleep(delay: number): Promise<void> {
    return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), delay);
    });
}

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