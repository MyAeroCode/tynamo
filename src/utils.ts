import {
    ChunkOrValue,
    DatatypeOrChunk,
    SerializerOrChunk,
    SerializerArg,
    DeserializerOrChunk,
    DeserializerArg
} from "./type";

//
export function defaultDatatype(): (...args: any[]) => DatatypeOrChunk {
    return function() {
        throw new Error(`Please specify the type explicitly.`);
    };
}

// Serialize the values of the same propertyName.
export function defaultSerialize(): (...args: any[]) => SerializerOrChunk<any> {
    return function(arg: SerializerArg<any>): any {
        return arg.object[arg.objectPropertyName];
    };
}

// Gets the value of the datatype location described.
export function defaultDeserialize(): (...args: any[]) => DeserializerOrChunk<any> {
    return function(arg: DeserializerArg) {
        return {
            [arg.objectPropertyName]: arg.dynamo[arg.dynamoPropertyName][arg.dynamoDatatypeName]
        };
    };
}

// Get the value from Chunk or Value.
export function fetchFromChunkOrValue<TObject>(cov: ChunkOrValue<TObject, any>, arg: any, ...args: any[]): TObject {
    if (cov == undefined) throw new Error("not allow empty.");

    let shadow = cov as any;
    let fetch: TObject;
    if (shadow.constructor == Function) {
        fetch = shadow.call(null, args).call(null, arg);
    } else {
        fetch = shadow;
    }
    return fetch;
}