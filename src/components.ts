import {ComponentLoader} from 'adminjs'
//import bundle from '@adminjs/custom-components'

import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);

const componentLoader = new ComponentLoader()

const Components = {
    Dashboard: componentLoader.add('Dashboard', path.resolve(__dirname, "Dashboard")),
    //PDFGenerator: componentLoader.add('GeneratePDF', './pdfgenerator.components'),
    //CustomComponent: bundle(componentLoader, 'CustomComponent'),
};

export{Components, componentLoader}