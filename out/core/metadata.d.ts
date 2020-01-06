import { PropertyDescriptor, EntityDescriptor, PropertyDecoratorArgs, TableInformation } from "./type";
declare class MetaData {
    /**
     * Attch TClass and TableInformation into metadata.
     * - TClass is for create a new object.
     * - TableInformation is for create a new DynamoTable when corresponding table is no exist.
     */
    registEntity(TClass: any, particialTableInfo?: Partial<TableInformation>): void;
    /**
     * Insert one Property Descriptor.
     * It can be merged if it does not conflict.
     */
    registProperty(TClassConstructor: any, sourcePropertyName: string, args: PropertyDecoratorArgs<any>): void;
    /**
     * Examine for conflicting property.
     * Test if the duplicate keyType or propertyName.
     */
    private propertyConflictTest;
    /**
     * Get the Entity Descriptor associated with a given constructor.
     */
    getEntityDescriptorByConstructor<TSource>(TClassConstructor: any): EntityDescriptor<TSource>;
    /**
     * Get the TableInfo associated with a given constructor.
     * TableInfo contain informations for create table. (tableName, billingmode, ...)
     */
    getTableInfoByConstructor(TClassConstructor: any): TableInformation;
    /**
     * Get the keys associated with a given constructor.
     * It contain hash key, and maybe contain sort key.
     */
    getKeysByConstructor(TClassConstructor: any): PropertyDescriptor<any>[];
}
declare const _: MetaData;
export default _;
//# sourceMappingURL=metadata.d.ts.map