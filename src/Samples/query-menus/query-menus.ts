import "es6-promise/auto";
import * as SDK from "azure-devops-extension-sdk";

SDK.register("query-menu", () => {
    return {
        execute: async (context: any) => {
            alert("Custom query menu item! Action context logged to developer console.");
            console.log(context);
        }
    }
});

SDK.init();