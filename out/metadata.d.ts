import { PropertyDescriptor, EntityDescriptor, Item } from "./type";
declare class MetaData {
    private meta;
    private propertyConflictTest;
    registEntity(TClass: any): void;
    registPropertyDescriptor<TSource>(propertyDescriptor: PropertyDescriptor<TSource>): void;
    getOf<TSource>(object: any): EntityDescriptor<TSource>;
    getTClassOf(dynamo: Item): any;
    private getAllPropertiesOf;
}
declare const metaData: MetaData;
export default metaData;
//# sourceMappingURL=metadata.d.ts.map