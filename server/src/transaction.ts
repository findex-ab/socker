import { BinaryKeyValueStore } from '#/shared/binaryKVStore';
import { BinaryPrimitive, EBinaryPrimitiveComponentType, EBinaryPrimitiveType } from '#/shared/binaryPrimitive';
import fs from 'fs';
import pathlib from 'path';
import * as UUID from 'uuid';

export enum ETransactionState {
  NONE = 'NONE',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

export type ITransactionInit = {
  id: string;
  outputDir?: string;
}

export type ITransactionWriteArgs = {
  chunkIndex: number;
  data: Uint8Array;
}

export class Transaction {
  state: ETransactionState = ETransactionState.NONE;
  id: string;
  uuid: string;
  outputDir: string = '/tmp';
  fd: number = -1;

  constructor(init: ITransactionInit) {
    this.id = init.id;
    const namespace = '1b671a64-40d5-491e-99b0-da01ff1f3341';
    this.uuid = UUID.v5(init.id, namespace);
    this.outputDir = init.outputDir || this.outputDir;
  }

  getFilename() {
    return `${this.uuid}.bin`;
  }

  getFilepath() {
    return pathlib.join(this.outputDir, this.getFilename());
  }

  isOpen(): boolean {
    return this.state === ETransactionState.OPEN;
  }

  isClosed(): boolean {
    return this.state === ETransactionState.CLOSED;
  }
  
  open(mode: string = 'w', filepath?: string) {
    if (this.isOpen()) {
      console.warn('Transaction is already opened.');
      return;
    }
    this.fd = fs.openSync(filepath || this.getFilepath(),  mode);
    this.state = ETransactionState.OPEN;
  }

  close() {
    if (!this.isOpen()) {
      console.warn('Transaction is not open.');
      return;
    }
    if (this.isClosed()) {
      console.warn('Transaction is already closed.');
      return;
    }
    if (this.fd !== -1) {
      fs.closeSync(this.fd);
    }
    this.state = ETransactionState.CLOSED;
    this.fd = -1;
  }


  write(args: ITransactionWriteArgs) {
    if (!this.isOpen()) {
      console.warn('Transaction is not open.');
      return;
    }
    const kv = BinaryKeyValueStore.fromJS(args);
    const bin = kv.toBinary();
    fs.appendFileSync(this.fd, (new BinaryPrimitive()).setString('CHUNK').data, { encoding: 'binary' });
    fs.appendFileSync(this.fd, (new BinaryPrimitive()).setUint32(bin.length).data, { encoding: 'binary' });
    fs.appendFileSync(this.fd, bin, { encoding: 'binary' });
  }

  read(): Generator<BinaryKeyValueStore, void, undefined> | null {
    if (!this.isOpen()) {
      console.warn('Transaction is not open.');
      return null;
    }

    const transaction = this;

    function* iter(): Generator<BinaryKeyValueStore, void, undefined> {
      

      while (true) {
        const chunkBuff = new BinaryPrimitive(new Uint8Array(5), EBinaryPrimitiveType.ARRAY, EBinaryPrimitiveComponentType.CHAR);
        const chunkView = new DataView(chunkBuff.data.buffer);
        fs.readSync(transaction.fd, chunkView, {
        });
        if (chunkBuff.getString() !== 'CHUNK') break;
        
        const sizeBuff = new BinaryPrimitive(new Uint8Array(4), EBinaryPrimitiveType.SCALAR, EBinaryPrimitiveComponentType.UINT32);
        const sizeView = new DataView(sizeBuff.data.buffer);
        fs.readSync(transaction.fd, sizeView, {
        });
        const size = sizeBuff.getUint32();
        if (size <= 0) {
          console.warn(`Encountered size <= 0`);
          break;
        }


        const storeBuff = new BinaryPrimitive(new Uint8Array(size), EBinaryPrimitiveType.ARRAY, EBinaryPrimitiveComponentType.BYTE);
        const storeView = new DataView(storeBuff.data.buffer);
        const bytesRead = fs.readSync(transaction.fd, storeView, {});
        if (bytesRead !== size) {
          console.warn('Size mismatch.');
          break;
        }

        const kv = BinaryKeyValueStore.fromBinarySafe(storeBuff.getBytes());
        if (!kv) {
          console.warn(`Failed to read BinaryKeyValueStore from file.`);
          break;
        }

        yield kv;
      }
    }
    
    return iter(); 
  }

}
