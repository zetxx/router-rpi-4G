const bitmapByte = (new Array(8)).fill(0).map((k, idx) => (1 << idx)).reverse();
const parseBitmapByte = (byte, byteNum) => bitmapByte.map((bit, idx) => (((byte & bit) === bit) && (idx + 1 + byteNum)) || 0);

const parseBitmap = (payload, bitmapNum = 0) => {
    var bitmap = (new Array(8))
        .fill(0)
        .reduce((accum, v, idx) => accum.concat(parseBitmapByte(payload.slice(idx, idx + 1).readUIntBE(0, 1), (idx * 8) + bitmapNum)), [])
        .filter((e) => e);
    let rest = payload.slice(8);
    if ((bitmap[0] - bitmapNum) === 1) {
        if (!rest.length) {
            throw new Error('no more bitmap records found, but there should be at least 1');
        }
        var r = parseBitmap(rest, bitmapNum + 64);
        return {bitmap: bitmap.concat(r.bitmap), rest: r.rest};
    }
    return {bitmap, rest};
};
const decode = (payload) => {
    return parseBitmap(payload);
};
console.log(decode(Buffer.from('F238800108E0800F80000000000000004000000000000000', 'hex')));
