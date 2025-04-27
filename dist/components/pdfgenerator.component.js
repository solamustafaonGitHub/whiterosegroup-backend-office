"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined)
        k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined)
        k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule)
        return mod;
    var result = {};
    if (mod != null)
        for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const adminjs_1 = require("adminjs");
const design_system_1 = require("@adminjs/design-system");
const GeneratePdf = (props) => {
    const { record, resource } = props;
    const api = new adminjs_1.ApiClient();
    (0, react_1.useEffect)(() => {
        api.recordAction({
            recordId: record.id,
            resourceId: resource.id,
            actionName: 'PDFGenerator'
        }).then((response) => {
            window.location.href = response.data.url;
        }).catch((err) => {
            console.error(err);
        });
    }, []);
    return React.createElement(design_system_1.Loader, null);
};
exports.default = GeneratePdf;
export {};
