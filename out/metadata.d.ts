import { FieldDescriptor, Maybe, TableDescriptor } from "./type";
declare class Metadata {
    private global;
    private checkConflict;
    add<TObject>(fieldDescriptor: FieldDescriptor<TObject>): void;
    getOf(object: Object): Maybe<TableDescriptor<any>>;
}
declare const metadata: Metadata;
export default metadata;
//# sourceMappingURL=metadata.d.ts.map