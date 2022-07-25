const { getDestination, executeHttpRequest, buildCsrfHeaders } = require("@sap-cloud-sdk/core");
const { setLogLevel } = require('@sap-cloud-sdk/util');
setLogLevel('error', 'env-destination-accessor');
setLogLevel('error', 'destination-accessor-vcap');
setLogLevel('error', 'destination-accessor-service');
setLogLevel('error', 'xsuaa-service');
setLogLevel('error', 'proxy-util');
setLogLevel('error', 'http-client');
setLogLevel('error', 'environment-accessor');

const destinationName = "SAP_Notifications_Launchpad";
const notificationEndpoint = "v2/Notification.svc";
const notificationTypesEndpoint = "v2/NotificationType.svc";

const passport = require('passport');
const xsenv = require('@sap/xsenv');
const JWTStrategy = require('@sap/xssec').JWTStrategy;
const services = xsenv.getServices({ uaa: 'mrobe-xsuaa-service' });

const SapCfAxios = require('sap-cf-axios').default;
// const axios = SapCfAxios(destinationName);

class NotificationService {
    static async getNotificationTypes() {
        const axios = SapCfAxios(destinationName);
        const response = await axios({
            method: "GET",
            url: notificationTypesEndpoint + "/NotificationTypes",
            headers: {
                "X-CSRF-Token": "FETCH"
            }
        });
        return response.data.d.results;
    }

    static async postNotificationType(notificationType) {
        const axios = SapCfAxios(destinationName);

        const response1 = await axios({
            method: "GET",
            url: notificationTypesEndpoint + "/NotificationTypes",
            headers: {
                "X-CSRF-Token": "FETCH"
            }
        });
        // return response.data.d.results;

        const response = await axios({
            method: "POST",
            url: notificationTypesEndpoint + "/NotificationTypes",
            data: notificationType,
            headers: {
                'cookie': response1.headers['set-cookie'][0].split(";")[0] + ";" + response1.headers['set-cookie'][1].split(";")[0],
                'x-csrf-token': response1.headers['x-csrf-token']
            }

        });
        return response.data.d;
    }

    static async postNotification(notification) {
        const axios = SapCfAxios(destinationName);
        const response1 = await axios({
            method: "GET",
            url: notificationTypesEndpoint + "/NotificationTypes",
            headers: {
                "X-CSRF-Token": "FETCH"
            }
        });
        const response = await axios({
            method: "POST",
            url: notificationEndpoint + "/Notifications",
            data: notification,
            headers: {
                'cookie': response1.headers['set-cookie'][0].split(";")[0] + ";" + response1.headers['set-cookie'][1].split(";")[0],
                'x-csrf-token': response1.headers['x-csrf-token']
            }
        });
        return response.data.d;
    }
}

module.exports = { NotificationService };