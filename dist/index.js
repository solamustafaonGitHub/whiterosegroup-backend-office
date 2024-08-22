import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import express from 'express';
import mongoose from 'mongoose';
import * as AdminJSMongoose from '@adminjs/mongoose';
import { Products } from "./products.model.js";
import { Components, componentLoader } from './components.js';
const PORT = 3000;
AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
});
const start = async () => {
    const app = express();
    await mongoose.connect("mongodb+srv://jorgehausconsulting:Woman1010@cluster0.rsvxjzs.mongodb.net/asset360");
    const myCustomTheme = {
        id: 'my-custom-theme',
        name: 'My Custom Theme',
        overrides: {
            colors: {
                primary100: 'green',
            },
        },
    };
    const adminJS = new AdminJS({
        resources: [{
                resource: Products, options: { id: 'Products Information', properties: { title: { isVisible: { list: true, edit: true, filter: true, show: true } } } }
            }],
        dashboard: {
            component: Components.Dashboard,
        },
        defaultTheme: myCustomTheme.id,
        availableThemes: [myCustomTheme],
        componentLoader
    });
    adminJS.watch();
    const adminRouter = AdminJSExpress.buildRouter(adminJS);
    app.use(adminJS.options.rootPath, adminRouter);
    app.listen(PORT, () => {
        console.log(`AdminJS started on http://localhost:${PORT}${adminJS.options.rootPath}`);
    });
};
start();
