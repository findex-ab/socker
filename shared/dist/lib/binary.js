import { range } from "./arrays";
export const unpackNumber = (x, numBytes) => {
    return range(numBytes).map(i => (x >> (i * numBytes)) & 0xFF);
};
export const packNumber = (bytes) => {
    let v = 0;
    for (let i = 0; i < bytes.length; i++) {
        v = (v << bytes.length) | bytes[i];
    }
    return v;
};
export const unpackUint32 = (x) => {
    return unpackNumber(x, 4);
};
export const uint32ToByteArray = (x) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, x);
    return new Uint8Array(buffer);
};
export const int32ToByteArray = (x) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setInt32(0, x);
    return new Uint8Array(buffer);
};
export const float32ToByteArray = (x) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, x);
    return new Uint8Array(buffer);
};
export const float64ToByteArray = (x) => {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, x);
    return new Uint8Array(buffer);
};
