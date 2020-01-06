import MetaData from "../core/metadata";
import { TableInformation } from "../core/type";

/**
 * Class Decorator :
 *      Add this class to metadata.
 */
export function DynamoEntity(particialTableInfo?: Partial<TableInformation>) {
    return (TClass: any) => {
        MetaData.registEntity(TClass, particialTableInfo);
    };
}
