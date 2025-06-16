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
    BOOL = 9,
    ARB = 10
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
    tag: number;
    constructor();
    constructor(data: Uint8Array, type: EBinaryPrimitiveType, componentType: EBinaryPrimitiveComponentType);
    setType(typ: EBinaryPrimitiveType): this;
    setComponentType(compType: EBinaryPrimitiveComponentType): this;
    setTag(tag: number): this;
    getRawBytes(): number[];
    getBuffer(): Buffer;
    getPIBuffer(): DataView;
    setUint32(value: number): this;
    getUint32(): number;
    setInt32(value: number): this;
    getInt32(): number;
    setFloat32(value: number): this;
    getFloat32(): number;
    setNumber(value: number): this;
    getNumber(): number;
    setByte(value: number): this;
    setBool(value: boolean): this;
    getBool(): boolean;
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
