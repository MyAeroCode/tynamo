import MetaData from "../core/metadata";
import { TableInformation, ClassCapture } from "../core/type";

/**
 * Class Decorator :
 *      Add this class to metadata.
 */
export function DynamoEntity(particialTableInfo?: Partial<TableInformation>) {
    return (TClass: ClassCapture<any>) => {
        MetaData.registEntity(TClass, particialTableInfo);
    };
}
