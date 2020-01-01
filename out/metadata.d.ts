import { PropertyDescriptor, EntityDescriptor, Item } from "./type";
declare class MetaData {
    private meta;
    private getTClassByDynamoCache;
    private propertyConflictTest;
    registEntity(TClass: any): void;
    registPropertyDescriptor<TSource>(propertyDescriptor: PropertyDescriptor<TSource>): void;
    getEntityDescriptorByHolder<TSource>(object: any): EntityDescriptor<TSource>;
    getTClassByDynamo(dynamo: Item): any;
    private getAllPropertiesOf;
}
declare const metaData: MetaData;
export default metaData;
//# sourceMappingURL=metadata.d.ts.map