import { PropertyDescriptor, EntityDescriptor, Item } from "../type";
declare class MetaData {
    private meta;
    private getTClassByDynamoCache;
    private propertyConflictTest;
    registEntity(TClass: any): void;
    registProperty<TSource>(propertyDescriptor: PropertyDescriptor<TSource>): void;
    getEntityDescriptorByHolder<TSource>(object: any): EntityDescriptor<TSource>;
    getTClassByDynamoItem(dynamo: Item): any;
    getAllPropertiesByEntityDescriptor(entityDescriptor: EntityDescriptor<any>): PropertyDescriptor<any>[];
    getPropertyDescriptorBySourceAndSourcePropertyName<TSource>(source: TSource, sourcePropertyName: keyof TSource): PropertyDescriptor<TSource>;
}
declare const metaData: MetaData;
export default metaData;
//# sourceMappingURL=metadata.d.ts.map