"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The DataType used in DynamoDB.
var DataType;
(function (DataType) {
    DataType["S"] = "S";
    DataType["N"] = "N";
    DataType["B"] = "B";
    DataType["SS"] = "SS";
    DataType["NS"] = "NS";
    DataType["BS"] = "BS";
    DataType["M"] = "M";
    DataType["L"] = "L";
    DataType["NULL"] = "NULL";
    DataType["BOOL"] = "BOOL"; // An attribute of type Boolean. For example:  "BOOL": true
})(DataType = exports.DataType || (exports.DataType = {}));
//  ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
//      Type for MetaData.
//  ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
// Property Type of DynamoDB.
// Specially, HASH and RANGE are KeyType.
var KeyType;
(function (KeyType) {
    KeyType["hash"] = "HASH";
    KeyType["sort"] = "RANGE";
    KeyType["attr"] = "ATTR";
})(KeyType = exports.KeyType || (exports.KeyType = {}));
// The argument of the Serializer function.
class SerializerArg {
}
exports.SerializerArg = SerializerArg;
// The argument of the Deserializer function.
class DeserializerArg {
}
exports.DeserializerArg = DeserializerArg;
// Parameters to create the PropertyDescriptor.
// Used in the DynamoItemField Decorator.
class PropertyDecoratorArgs {
}
exports.PropertyDecoratorArgs = PropertyDecoratorArgs;
// Describe how one property in DynamoItem is created.
// It also contain how to return to the original property from the DynamoItem property.
class PropertyDescriptor {
}
exports.PropertyDescriptor = PropertyDescriptor;
// Describe how one entity of DynamoDB is created.
class EntityDescriptor {
}
exports.EntityDescriptor = EntityDescriptor;
var FormationMask;
(function (FormationMask) {
    FormationMask[FormationMask["HashKey"] = 1] = "HashKey";
    FormationMask[FormationMask["RangeKey"] = 2] = "RangeKey";
    FormationMask[FormationMask["Body"] = 4] = "Body";
    FormationMask[FormationMask["KeyOnly"] = 3] = "KeyOnly";
    FormationMask[FormationMask["Full"] = 7] = "Full";
})(FormationMask = exports.FormationMask || (exports.FormationMask = {}));
//# sourceMappingURL=type.js.map