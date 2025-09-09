import { float32ToByteArray, int32ToByteArray, uint32ToByteArray } from "./binary";
import { isFloat, isUint } from "./is";

export enum EBinaryPrimitiveComponentType {
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

export enum EBinaryPrimitiveType {
  SCALAR = 0,
  ARRAY = 1
}

export class BinaryPrimitive {
  data: Uint8Array = new Uint8Array();
  type: EBinaryPrimitiveType = EBinaryPrimitiveType.SCALAR
  componentType: EBinaryPrimitiveComponentType = EBinaryPrimitiveComponentType.NULL;
  size: number = 0;
  tag: number = 0;

  constructor();
  constructor(
    data: Uint8Array,
    type: EBinaryPrimitiveType,
    componentType: EBinaryPrimitiveComponentType
  );
  constructor(
    data?: Uint8Array,
    type?: EBinaryPrimitiveType,
    componentType?: EBinaryPrimitiveComponentType
  ) {
    if (!data) return;
    if (typeof type !== 'number') return;
    if (typeof componentType !== 'number') return;
    this.data = data;
    this.type = type;
    this.componentType = componentType;
    this.size = this.data.length;
  }

  setType(typ: EBinaryPrimitiveType) {
    this.type = typ;
    return this;
  }

  setComponentType(compType: EBinaryPrimitiveComponentType) {
    this.componentType = compType;
    return this;
  }

  setTag(tag: number) {
    this.tag = tag;
    return this;
  }

  getRawBytes(): number[] {
    return Array.from(this.data.values());
  }

  getBuffer(): Buffer {
    const bytes = this.getRawBytes();
    const buff = Buffer.from(bytes);
    return buff;
  }

  // PI = platform independant
  getPIBuffer(): DataView {
    return new DataView(this.data.buffer)
  }

  setUint32(value: number) {
    this.type = EBinaryPrimitiveType.SCALAR;
    this.componentType = EBinaryPrimitiveComponentType.UINT32;
    this.data = uint32ToByteArray(value);
    this.size = this.data.length;
    return this;
  }

  getUint32() {
    return this.getPIBuffer().getUint32(0, false);//this.getBuffer().readUint32BE();
  }

  setInt32(value: number) {
    this.type = EBinaryPrimitiveType.SCALAR;
    this.componentType = EBinaryPrimitiveComponentType.INT32;
    this.data = int32ToByteArray(value);
    this.size = this.data.length;
    return this;
  }

  getInt32() {
    return this.getPIBuffer().getInt32(0, false);//this.getBuffer().readInt32BE();
  }

  setFloat32(value: number) {
    this.type = EBinaryPrimitiveType.SCALAR;
    this.componentType = EBinaryPrimitiveComponentType.FLOAT32;
    this.data = float32ToByteArray(value);
    this.size = this.data.length;
    return this;
  }

  getFloat32() {
    return this.getPIBuffer().getFloat32(0, false);//this.getBuffer().readFloatBE();
  }

  setNumber(value: number) {
    if (isFloat(value)) return this.setFloat32(value);
    if (isUint(value)) return this.setUint32(value);
    return this.setInt32(value);
  }

  getNumber(): number {
    switch (this.componentType) {
      case EBinaryPrimitiveComponentType.UINT32: return this.getUint32();
      case EBinaryPrimitiveComponentType.INT32: return this.getInt32();
      case EBinaryPrimitiveComponentType.FLOAT32: return this.getFloat32();
      case EBinaryPrimitiveComponentType.CHAR: return this.getChar();
      case EBinaryPrimitiveComponentType.BYTE: return this.getByte();
      default: return 0;
    }
  }

  setByte(value: number) {
    this.type = EBinaryPrimitiveType.SCALAR;
    this.componentType = EBinaryPrimitiveComponentType.BYTE;
    this.data = new Uint8Array([value]);
    this.size = this.data.length;
    return this;
  }

  setBool(value: boolean) {
    this.type = EBinaryPrimitiveType.SCALAR;
    this.componentType = EBinaryPrimitiveComponentType.BOOL;
    this.data = new Uint8Array([value === true ? 1 : 0]);
    this.size = this.data.length;
    return this;
  }

  getBool(): boolean {
    return this.getByte() >= 1;
  }

  setBytes(data: Uint8Array) {
    this.type = EBinaryPrimitiveType.ARRAY;
    this.componentType = EBinaryPrimitiveComponentType.BYTE;
    this.data = data;
    this.size = this.data.length;
    return this;
  }

  getBytes(): Uint8Array {
    return this.data;
  }

  getByte(): number {
    return this.getPIBuffer().getUint8(0);//this.getBuffer().readUint8();
  } 

  setChar(value: string) {
    return this.setByte(value.charCodeAt(0)).setComponentType(EBinaryPrimitiveComponentType.CHAR);
  }

  getChar() {
    return this.getByte();
  } 

  setString(value: string) {
    this.type = EBinaryPrimitiveType.ARRAY;
    this.componentType = EBinaryPrimitiveComponentType.CHAR;
    const encoder = new TextEncoder();
    
    this.data = encoder.encode(value);//new Uint8Array(Array.from(value).map(c => c.charCodeAt(0)));
    this.size = this.data.length;
    return this;
  }

  getString() {
    const decoder = new TextDecoder();
    return decoder.decode(this.getBytes());
   // return this.getRawBytes().map(code => String.fromCharCode(Number(code))).join('')
  }

  setNull() {
    this.data = new Uint8Array();
    this.size = 0;
    this.componentType = EBinaryPrimitiveComponentType.NULL;
    this.type = EBinaryPrimitiveType.SCALAR;
    return this;
  }

  setArray(arr: Array<BinaryPrimitive>) {
    if (arr.length <= 0) {
      return this.setNull();
    }
    this.componentType = arr[0].componentType;
    this.type = EBinaryPrimitiveType.ARRAY;
    
    let totalSize: number = 0;

    for (const prim of arr) {
      totalSize += prim.data.length;
    }
    
    if (totalSize <= 0) return this;
    this.data = new Uint8Array(totalSize);

    let offset: number = 0;
    for (const prim of arr) {
      this.data.set(prim.data, offset);
      offset += prim.data.length;
    }

    this.size = this.data.length;

    return this;
  }

  getComponentSize(): number {
    if (this.type === EBinaryPrimitiveType.SCALAR) return this.data.length;
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

  getSlice(offset: number, length: number): BinaryPrimitive {
    const part = this.data.slice(offset, offset + length);
    const prim = new BinaryPrimitive();
    prim.data = part;
    prim.size = part.length;
    prim.type = this.type;
    prim.componentType = this.componentType;
    return prim;
  }

  getArray(): Array<BinaryPrimitive> {
    const componentSize = this.getComponentSize();
    if (componentSize <= 0) return [];

    const prims: BinaryPrimitive[] = [];
    let offset: number = 0;

    while (offset < this.data.length) {
      const prim = this.getSlice(offset, componentSize);
      prims.push(prim);
      offset += componentSize;
    }

    return prims;
  }
}
