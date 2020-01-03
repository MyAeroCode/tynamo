import MetaData from "../core/metadata";

// Class Decorator :
//      Add this class to metadata.
export function DynamoEntity(TClass: any) {
    MetaData.registEntity(TClass);
}
