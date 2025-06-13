import { float32ToByteArray, int32ToByteArray, uint32ToByteArray } from "./binary";
import { isFloat, isUint } from "./is";
export var EBinaryPrimitiveComponentType;
(function (EBinaryPrimitiveComponentType) {
    EBinaryPrimitiveComponentType[EBinaryPrimitiveComponentType["NULL"] = 0] = "NULL";
    EBinaryPrimitiveComponentType[EBinaryPrimitiveComponentType["INT32"] = 1] = "INT32";
    EBinaryPrimitiveComponentType[EBinaryPrimitiveComponentType["INT64"] = 2] = "INT64";
    EBinaryPrimitiveComponentType[EBinaryPrimitiveComponentType["UINT32"] = 3] = "UINT32";
    EBinaryPrimitiveComponentType[EBinaryPrimitiveComponentType["UINT64"] = 4] = "UINT64";
    EBinaryPrimitiveComponentType[EBinaryPrimitiveComponentType["FLOAT32"] = 5] = "FLOAT32";
    EBinaryPrimitiveComponentType[EBinaryPrimitiveComponentType["FLOAT64"] = 6] = "FLOAT64";
    EBinaryPrimitiveComponentType[EBinaryPrimitiveComponentType["CHAR"] = 7] = "CHAR";
    EBinaryPrimitiveComponentType[EBinaryPrimitiveComponentType["BYTE"] = 8] = "BYTE";
    EBinaryPrimitiveComponentType[EBinaryPrimitiveComponentType["ARB"] = 9] = "ARB";
})(EBinaryPrimitiveComponentType || (EBinaryPrimitiveComponentType = {}));
export var EBinaryPrimitiveType;
(function (EBinaryPrimitiveType) {
    EBinaryPrimitiveType[EBinaryPrimitiveType["SCALAR"] = 0] = "SCALAR";
    EBinaryPrimitiveType[EBinaryPrimitiveType["ARRAY"] = 1] = "ARRAY";
})(EBinaryPrimitiveType || (EBinaryPrimitiveType = {}));
export class BinaryPrimitive {
    data = new Uint8Array();
    type = EBinaryPrimitiveType.SCALAR;
    componentType = EBinaryPrimitiveComponentType.NULL;
    size = 0;
    tag = 0;
    constructor(data, type, componentType) {
        if (!data)
            return;
        if (typeof type !== 'number')
            return;
        if (typeof componentType !== 'number')
            return;
        this.data = data;
        this.type = type;
        this.componentType = componentType;
        this.size = this.data.length;
    }
    setType(typ) {
        this.type = typ;
        return this;
    }
    setComponentType(compType) {
        this.componentType = compType;
        return this;
    }
    setTag(tag) {
        this.tag = tag;
        return this;
    }
    getRawBytes() {
        return Array.from(this.data.values());
    }
    getBuffer() {
        const bytes = this.getRawBytes();
        const buff = Buffer.from(bytes);
        return buff;
    }
    // PI = platform independant
    getPIBuffer() {
        return new DataView(this.data.buffer);
    }
    setUint32(value) {
        this.type = EBinaryPrimitiveType.SCALAR;
        this.componentType = EBinaryPrimitiveComponentType.UINT32;
        this.data = uint32ToByteArray(value);
        this.size = this.data.length;
        return this;
    }
    getUint32() {
        return this.getPIBuffer().getUint32(0, false); //this.getBuffer().readUint32BE();
    }
    setInt32(value) {
        this.type = EBinaryPrimitiveType.SCALAR;
        this.componentType = EBinaryPrimitiveComponentType.INT32;
        this.data = int32ToByteArray(value);
        this.size = this.data.length;
        return this;
    }
    getInt32() {
        return this.getPIBuffer().getInt32(0, false); //this.getBuffer().readInt32BE();
    }
    setFloat32(value) {
        this.type = EBinaryPrimitiveType.SCALAR;
        this.componentType = EBinaryPrimitiveComponentType.FLOAT32;
        this.data = float32ToByteArray(value);
        this.size = this.data.length;
        return this;
    }
    getFloat32() {
        return this.getPIBuffer().getFloat32(0, false); //this.getBuffer().readFloatBE();
    }
    setNumber(value) {
        if (isFloat(value))
            return this.setFloat32(value);
        if (isUint(value))
            return this.setUint32(value);
        return this.setInt32(value);
    }
    getNumber() {
        switch (this.componentType) {
            case EBinaryPrimitiveComponentType.UINT32: return this.getUint32();
            case EBinaryPrimitiveComponentType.INT32: return this.getInt32();
            case EBinaryPrimitiveComponentType.FLOAT32: return this.getFloat32();
            case EBinaryPrimitiveComponentType.CHAR: return this.getChar();
            case EBinaryPrimitiveComponentType.BYTE: return this.getByte();
            default: return 0;
        }
    }
    setByte(value) {
        this.type = EBinaryPrimitiveType.SCALAR;
        this.componentType = EBinaryPrimitiveComponentType.BYTE;
        this.data = new Uint8Array([value]);
        this.size = this.data.length;
        return this;
    }
    setBytes(data) {
        this.type = EBinaryPrimitiveType.ARRAY;
        this.componentType = EBinaryPrimitiveComponentType.BYTE;
        this.data = data;
        this.size = this.data.length;
        return this;
    }
    getBytes() {
        return this.data;
    }
    getByte() {
        return this.getPIBuffer().getUint8(0); //this.getBuffer().readUint8();
    }
    setChar(value) {
        return this.setByte(value.charCodeAt(0)).setComponentType(EBinaryPrimitiveComponentType.CHAR);
    }
    getChar() {
        return this.getByte();
    }
    setString(value) {
        this.type = EBinaryPrimitiveType.ARRAY;
        this.componentType = EBinaryPrimitiveComponentType.CHAR;
        this.data = new Uint8Array(Array.from(value).map(c => c.charCodeAt(0)));
        this.size = this.data.length;
        return this;
    }
    getString() {
        return this.getRawBytes().map(code => String.fromCharCode(Number(code))).join('');
    }
    setNull() {
        this.data = new Uint8Array();
        this.size = 0;
        this.componentType = EBinaryPrimitiveComponentType.NULL;
        this.type = EBinaryPrimitiveType.SCALAR;
        return this;
    }
    setArray(arr) {
        if (arr.length <= 0) {
            return this.setNull();
        }
        this.componentType = arr[0].componentType;
        this.type = EBinaryPrimitiveType.ARRAY;
        let totalSize = 0;
        for (const prim of arr) {
            totalSize += prim.data.length;
        }
        if (totalSize <= 0)
            return this;
        this.data = new Uint8Array(totalSize);
        let offset = 0;
        for (const prim of arr) {
            this.data.set(prim.data, offset);
            offset += prim.data.length;
        }
        this.size = this.data.length;
        return this;
    }
    getComponentSize() {
        if (this.type === EBinaryPrimitiveType.SCALAR)
            return this.data.length;
        switch (this.componentType) {
            case EBinaryPrimitiveComponentType.NULL: return 0;
            case EBinaryPrimitiveComponentType.CHAR: return 1;
            case EBinaryPrimitiveComponentType.BYTE: return 1;
            case EBinaryPrimitiveComponentType.ARB: return 1;
            case EBinaryPrimitiveComponentType.INT32: return 4;
            case EBinaryPrimitiveComponentType.UINT32: return 4;
            case EBinaryPrimitiveComponentType.FLOAT32: return 4;
            case EBinaryPrimitiveComponentType.FLOAT64: return 8;
            default: return 1;
        }
    }
    getSlice(offset, length) {
        const part = this.data.slice(offset, offset + length);
        const prim = new BinaryPrimitive();
        prim.data = part;
        prim.size = part.length;
        prim.type = this.type;
        prim.componentType = this.componentType;
        return prim;
    }
    getArray() {
        const componentSize = this.getComponentSize();
        if (componentSize <= 0)
            return [];
        const prims = [];
        let offset = 0;
        while (offset < this.data.length) {
            const prim = this.getSlice(offset, componentSize);
            prims.push(prim);
            offset += componentSize;
        }
        return prims;
    }
}
