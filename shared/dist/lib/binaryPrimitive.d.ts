export declare enum EBinaryPrimitiveComponentType {
    NULL = 0,
    INT32 = 1,
    INT64 = 2,
    UINT32 = 3,
    UINT64 = 4,
    FLOAT32 = 5,
    FLOAT64 = 6,
    CHAR = 7,
    BYTE = 8,
    ARB = 9
}
export declare enum EBinaryPrimitiveType {
    SCALAR = 0,
    ARRAY = 1
}
export declare class BinaryPrimitive {
    data: Uint8Array;
    type: EBinaryPrimitiveType;
    componentType: EBinaryPrimitiveComponentType;
    size: number;
    constructor();
    constructor(data: Uint8Array, type: EBinaryPrimitiveType, componentType: EBinaryPrimitiveComponentType);
    setType(typ: EBinaryPrimitiveType): this;
    setComponentType(compType: EBinaryPrimitiveComponentType): this;
    getRawBytes(): number[];
    getBuffer(): Buffer;
    setUint32(value: number): this;
    getUint32(): number;
    setInt32(value: number): this;
    getInt32(): number;
    setFloat32(value: number): this;
    getFloat32(): number;
    setNumber(value: number): this;
    getNumber(): number;
    setByte(value: number): this;
    setBytes(data: Uint8Array): this;
    getBytes(): Uint8Array;
    getByte(): number;
    setChar(value: string): this;
    getChar(): number;
    setString(value: string): this;
    getString(): string;
    setNull(): this;
    setArray(arr: Array<BinaryPrimitive>): this;
    getComponentSize(): number;
    getSlice(offset: number, length: number): BinaryPrimitive;
    getArray(): Array<BinaryPrimitive>;
}
