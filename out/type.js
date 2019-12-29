"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// The data-type used in DynamoDB.
var Datatype;
(function (Datatype) {
    Datatype["S"] = "S";
    Datatype["N"] = "N";
    Datatype["B"] = "B";
    Datatype["SS"] = "SS";
    Datatype["NS"] = "NS";
    Datatype["BS"] = "BS";
    Datatype["M"] = "M";
    Datatype["L"] = "L";
    Datatype["NULL"] = "NULL";
    Datatype["BOOL"] = "BOOL";
    Datatype["NESTED"] = "NESTED"; // for nested class.
})(Datatype = exports.Datatype || (exports.Datatype = {}));
// Key type of item field
var Fieldtype;
(function (Fieldtype) {
    Fieldtype["hash"] = "HASH";
    Fieldtype["range"] = "RANGE";
    Fieldtype["attr"] = "ATTR";
})(Fieldtype = exports.Fieldtype || (exports.Fieldtype = {}));
var FormationMask;
(function (FormationMask) {
    FormationMask[FormationMask["HashKey"] = 1] = "HashKey";
    FormationMask[FormationMask["RangeKey"] = 2] = "RangeKey";
    FormationMask[FormationMask["Body"] = 4] = "Body";
    FormationMask[FormationMask["KeyOnly"] = 3] = "KeyOnly";
    FormationMask[FormationMask["Full"] = 7] = "Full";
})(FormationMask = exports.FormationMask || (exports.FormationMask = {}));
//# sourceMappingURL=type.js.map