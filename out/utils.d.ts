import { ChunkOrValue, DatatypeOrChunk, SerializerOrChunk, DeserializerOrChunk } from "./type";
export declare function defaultDatatype(): (...args: any[]) => DatatypeOrChunk;
export declare function defaultSerialize(): (...args: any[]) => SerializerOrChunk<any>;
export declare function defaultDeserialize(): (...args: any[]) => DeserializerOrChunk<any>;
export declare function fetchFromChunkOrValue<TObject>(cov: ChunkOrValue<TObject, any>, arg: any, ...args: any[]): TObject;
//# sourceMappingURL=utils.d.ts.map