const { publishNotification } = require("./vendorNotifications");
const axios = require("axios");
require('@sap/xsenv').loadEnv();

module.exports = {
    mainPayload: async function (oObj) {
        try {
            await publishNotification(oObj);
            console.log("Success");
        } catch (e) {
            if (e.response) {
                console.error(`${e.response.statusText} (${e.response.status}): ${JSON.stringify(e.response.data.error.message)}.`)
            } else {
                console.error(e)
            }
        }
    }
}