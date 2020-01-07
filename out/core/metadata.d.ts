import { PropertyDescriptor, EntityDescriptor, PropertyDecoratorArgs, TableInformation, ClassCapture } from "./type";
declare class MetaData {
    /**
     * Attch TClass and TableInformation into metadata.
     * - TClass is for create a new object.
     * - TableInformation is for create a new DynamoTable when corresponding table is no exist.
     */
    registEntity<TSource>(TClass: ClassCapture<TSource>, particialTableInfo?: Partial<TableInformation>): void;
    /**
     * Insert one Property Descriptor.
     * It can be merged if it does not conflict.
     */
    registProperty<TSource>(TClass: ClassCapture<TSource>, sourcePropertyName: string, args: PropertyDecoratorArgs): void;
    /**
     * Examine for conflicting property.
     * Test if the duplicate keyType or propertyName.
     */
    private propertyConflictTest;
    /**
     * Get the Entity Descriptor associated with a given constructor.
     */
    getEntityDescriptorByConstructor<TSource>(TClass: ClassCapture<TSource>): EntityDescriptor<TSource>;
    /**
     * Get the TableInfo associated with a given constructor.
     * TableInfo contain informations for create table. (tableName, billingmode, ...)
     */
    getTableInfoByConstructor<TSource>(TClass: ClassCapture<TSource>): TableInformation;
    /**
     * Get the keys associated with a given constructor.
     * It contain hash key, and maybe contain sort key.
     */
    getKeysByConstructor<TSource>(TClass: ClassCapture<TSource>): PropertyDescriptor<any, any>[];
}
declare const _: MetaData;
export default _;
//# sourceMappingURL=metadata.d.ts.map