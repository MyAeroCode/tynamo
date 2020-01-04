import { EntityDescriptor, PropertyDecoratorArgs } from "../type";
declare class MetaData {
    registEntity(TClass: any): void;
    registProperty(TClassConstructor: any, sourcePropertyName: string, args: PropertyDecoratorArgs<any>): void;
    private propertyConflictTest;
    getEntityDescriptorByConstructor<TSource>(TClassConstructor: any): EntityDescriptor<TSource>;
}
declare const metaData: MetaData;
export default metaData;
//# sourceMappingURL=metadata.d.ts.map