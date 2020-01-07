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
// Core Feature.
const tynamo_1 = __importDefault(require("./core/tynamo"));
exports.Tynamo = tynamo_1.default;
const mapper_1 = __importDefault(require("./core/mapper"));
exports.Mapper = mapper_1.default;
const metadata_1 = __importDefault(require("./core/metadata"));
exports.MetaData = metadata_1.default;
const expressionParser_1 = __importDefault(require("./core/expressionParser"));
exports.ExpressionParser = expressionParser_1.default;
const type_1 = require("./core/type");
exports.DataType = type_1.DataType;
exports.KeyType = type_1.KeyType;
exports.SerializerArg = type_1.SerializerArg;
exports.DeserializerArg = type_1.DeserializerArg;
exports.PropertyDecoratorArgs = type_1.PropertyDecoratorArgs;
exports.PropertyDescriptor = type_1.PropertyDescriptor;
exports.EntityDescriptor = type_1.EntityDescriptor;
exports.FormationMask = type_1.FormationMask;
// Decorator.
const dynamo_property_1 = require("./decorator/dynamo-property");
exports.DynamoProperty = dynamo_property_1.DynamoProperty;
const dynamo_entity_1 = require("./decorator/dynamo-entity");
exports.DynamoEntity = dynamo_entity_1.DynamoEntity;
let Cat = class Cat {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
};
__decorate([
    dynamo_property_1.DynamoProperty({ keyType: type_1.KeyType.hash }),
    __metadata("design:type", Number)
], Cat.prototype, "id", void 0);
__decorate([
    dynamo_property_1.DynamoProperty({ keyType: type_1.KeyType.attr }),
    __metadata("design:type", String)
], Cat.prototype, "name", void 0);
Cat = __decorate([
    dynamo_entity_1.DynamoEntity(),
    __metadata("design:paramtypes", [Number, String])
], Cat);
//# sourceMappingURL=index.js.map