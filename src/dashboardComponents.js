"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentLoader = exports.Components = void 0;
const adminjs_1 = require("adminjs");
//import bundle from '@adminjs/custom-components'
const url_1 = require("url");
const path_1 = __importDefault(require("path"));
const __filename = (0, url_1.fileURLToPath)(import.meta.url);
const __dirname = path_1.default.dirname(__filename);
console.log(__dirname);
const componentLoader = new adminjs_1.ComponentLoader();
exports.componentLoader = componentLoader;
const Components = {
    Dashboard: componentLoader.add('Dashboard', path_1.default.resolve(__dirname, "Dashboard")),
    //PDFGenerator: componentLoader.add('GeneratePDF', './pdfgenerator.components'),
    //CustomComponent: bundle(componentLoader, 'CustomComponent'),
};
exports.Components = Components;
