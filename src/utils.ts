import {
    ChunkOrValue,
    Serializer,
    SerializerArg,
    Deserializer,
    DeserializerArg,
    Datatype,
    DatatypeOrChunk,
    DatatypeArg
} from "./type";
import dynamoFormation from "./dynamo-formation";
import metadata from "./metadata";
import { DynamoFormation } from ".";

// Get DynamoDataType of primitive type.
// Operate only for String, Number, and Boolean.
//
export const defaultDatatype: DatatypeOrChunk<any> = (arg: DatatypeArg<any>): Datatype => {
    const type = Reflect.getMetadata("design:type", arg.source, arg.sourcePropertyName);
    if (type === String) return Datatype.S;
    if (type === Number) return Datatype.N;
    if (type === Boolean) return Datatype.BOOL;
    throw new Error(`Please specify DynamoDataType of [${arg.source.constructor.name}.${arg.sourcePropertyName}]`);
};

// Using the value of the itself.
//
export const defaultSerializer: Serializer<any> = (arg: SerializerArg<any>) => {
    const serialized = arg.source[arg.sourcePropertyName];
    return serialized;
};

// Using the value of the described.
//
export const defaultDeserializer: Deserializer<any> = (arg: DeserializerArg): any => {
    if (arg.dynamoDatatype == Datatype.INJECT) {
        const type = Reflect.getMetadata("design:type", new arg.object(), arg.sourcePropertyName);
        const innerData = DynamoFormation.deformation(arg.dynamo, type);
        return innerData;
    } else {
        return arg.dynamo[arg.dynamoPropertyName][arg.dynamoDatatype];
    }
};

// Convert JsPrimitive to DynamoPrimitive.
// Operates after serialization is performed.
//
export function convertToDynamoPrimitive(jsPrimitive: any, datatype: Datatype): any {
    switch (datatype) {
        case Datatype.S:
        case Datatype.N:
        case Datatype.B:
            return jsPrimitive.toString();

        case Datatype.SS:
        case Datatype.NS:
        case Datatype.BS:
            return (jsPrimitive as any[]).map((v) => v.toString());

        case Datatype.BOOL:
            return jsPrimitive;

        case Datatype.NULL:
            return new Error(`No support NULL type.`);

        case Datatype.M:
            const map: any = {};
            for (let key in jsPrimitive) {
                const nestedFormation = dynamoFormation.formation(jsPrimitive[key]);
                const nestedField = {
                    [key]: nestedFormation
                };
                Object.assign(map, nestedField);
            }
            return map;

        case Datatype.L:
            const list = (jsPrimitive as any[]).map((elem) => dynamoFormation.formation(elem));
            return list;

        case Datatype.INJECT:
            const nestedFormation = dynamoFormation.formation(jsPrimitive);
            return nestedFormation;

        default:
            throw new Error();
    }
}

// Convert DynamoPrimitive to JsPrimitive.
// Operates after deserialization is performed.
//
export function convertToJsPrimitive(dynamoPrimitive: any, datatypeId: Datatype): any {
    switch (datatypeId) {
        case Datatype.S:
        case Datatype.B: // it must be string.
        case Datatype.BOOL:
            return dynamoPrimitive;

        case Datatype.N:
            return Number.parseFloat(dynamoPrimitive);

        case Datatype.SS:
        case Datatype.BS:
            return dynamoPrimitive;

        case Datatype.NS:
            return (dynamoPrimitive as string[]).map((nstr) => Number.parseFloat(nstr));

        case Datatype.NULL:
            return new Error(`No support NULL type.`);

        case Datatype.M:
            let deformation: any = {};
            for (let key in dynamoPrimitive) {
                const alike = metadata.searchClassObjectLike(dynamoPrimitive[key]);
                const nestedDeformation = dynamoFormation.deformation(dynamoPrimitive[key], alike);
                const nestedField = {
                    [key]: nestedDeformation
                };
                Object.assign(deformation, nestedField);
            }
            return deformation;

        case Datatype.L:
            return (dynamoPrimitive as any[]).map((elem) => {
                const alike = metadata.searchClassObjectLike(elem);
                const nestedDeformation = dynamoFormation.deformation(elem, alike);
                return nestedDeformation;
            });

        default:
            throw new Error();
    }
}

// Get the value from Chunk or Value.
//
export function fetchFromChunkOrValue<TObject>(cov: ChunkOrValue<TObject, any>, arg: any): TObject {
    if (cov == undefined) throw new Error("not allow empty.");

    const shadow = cov as any;
    if (shadow.constructor == Function) {
        return shadow.call(null, arg);
    } else {
        return shadow;
    }
}
