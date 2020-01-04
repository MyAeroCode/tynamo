"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dynamo_property_1 = require("./decorator/dynamo-property");
exports.DynamoProperty = dynamo_property_1.DynamoProperty;
const dynamo_entity_1 = require("./decorator/dynamo-entity");
exports.DynamoEntity = dynamo_entity_1.DynamoEntity;
const tynamo_1 = __importDefault(require("./core/tynamo"));
exports.TynamoFormation = tynamo_1.default;
const metadata_1 = __importDefault(require("./core/metadata"));
exports.MetaData = metadata_1.default;
const type_1 = require("./type");
exports.PropertyDecoratorArgs = type_1.PropertyDecoratorArgs;
exports.DataType = type_1.DataType;
exports.DataTypeResolverArg = type_1.DataTypeResolverArg;
exports.KeyType = type_1.KeyType;
exports.FormationMask = type_1.FormationMask;
exports.SerializerArg = type_1.SerializerArg;
exports.DeserializerArg = type_1.DeserializerArg;
exports.PropertyDescriptor = type_1.PropertyDescriptor;
let Entity = class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
};
__decorate([
    dynamo_property_1.DynamoProperty({
        keyType: type_1.KeyType.hash,
        propertyName: "id",
        serializer: (arg) => {
            const source = arg.source;
            return [source.x, source.y].join("_");
        },
        deserializer: (arg) => {
            const token = arg.dynamo.id.S.split("_");
            return {
                x: token[0],
                y: token[1]
            };
        }
    }),
    __metadata("design:type", String)
], Entity.prototype, "__id", void 0);
Entity = __decorate([
    dynamo_entity_1.DynamoEntity,
    __metadata("design:paramtypes", [String, String])
], Entity);
const entity = new Entity("Hello", "World!");
const dynamoItem = tynamo_1.default.formation(entity, Entity);
const r = tynamo_1.default.deformation(dynamoItem, Entity);
console.log(JSON.stringify(r, null, 4));
//# sourceMappingURL=index.js.map