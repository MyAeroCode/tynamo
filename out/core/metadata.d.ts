import { EntityDescriptor, PropertyDecoratorArgs } from "../type";
declare class MetaData {
    /**
     * Attch TClass and TableInformation into metadata.
     * - TClass is for create a new object.
     * - TableInformation is for create a new DynamoTable when corresponding table is no exist. (todo)
     */
    registEntity(TClass: any): void;
    registProperty(TClassConstructor: any, sourcePropertyName: string, args: PropertyDecoratorArgs<any>): void;
    private propertyConflictTest;
    getEntityDescriptorByConstructor<TSource>(TClassConstructor: any): EntityDescriptor<TSource>;
}
declare const metaData: MetaData;
export default metaData;
//# sourceMappingURL=metadata.d.ts.map