import { FieldDescriptor, TableDescriptor, Item } from "./type";
declare class Metadata {
    private global;
    private classObjectCache;
    private checkConflict;
    add<TObject>(fieldDescriptor: FieldDescriptor<TObject>): void;
    getOf<TObject>(object: Object): TableDescriptor<TObject>;
    searchClassObjectLike(item: Item): any;
    private getAllFieldsOf;
}
declare const metadata: Metadata;
export default metadata;
//# sourceMappingURL=metadata.d.ts.map