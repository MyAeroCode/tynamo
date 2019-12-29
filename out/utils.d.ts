import { ChunkOrValue, Serializer, Deserializer, Datatype, DatatypeOrChunk } from "./type";
export declare const defaultDatatype: DatatypeOrChunk<any>;
export declare const defaultSerializer: Serializer<any>;
export declare const defaultDeserializer: Deserializer<any>;
export declare function convertToDynamoPrimitive(jsPrimitive: any, datatype: Datatype): any;
export declare function convertToJsPrimitive(dynamoPrimitive: any, datatypeId: Datatype): any;
export declare function fetchFromChunkOrValue<TObject>(cov: ChunkOrValue<TObject, any>, arg: any): TObject;
//# sourceMappingURL=utils.d.ts.map