const { NotificationService } = require("./util/NotificationAPI");

const NOTIF_TYPE_KEY = "Vendor Request";
const NOTIF_TYPE_VERSION = "1.0";

function createNotificationType() {
    return {
        NotificationTypeKey: NOTIF_TYPE_KEY,
        NotificationTypeVersion: NOTIF_TYPE_VERSION,
        Templates: [
            {
                Language: "en",
                TemplatePublic: "A new Vendor Request needs your attention!",
                TemplateSensitive: "{{requestType}} Vendor Request: {{requestDetail}} from {{from_user}}",
                TemplateGrouped: "Vendor Request(s)",
                TemplateLanguage: "Mustache",
                Subtitle: "Vendor Request"
            }
        ]
    }
}

function createNotification({ requestType, requestDetail, from_user, recipients, priority }) {

    return {
        OriginId: NOTIF_TYPE_KEY,
        NotificationTypeKey: NOTIF_TYPE_KEY,
        NotificationTypeVersion: NOTIF_TYPE_VERSION,
        NavigationTargetAction: "display",
        NavigationTargetObject: "mro",
        Priority: priority,
        ProviderId: "",
        ActorId: "",
        ActorType: "",
        ActorDisplayText: "",
        ActorImageURL: "",
        Properties: [
            {
                Key: "requestType",
                Language: "en",
                Value: requestType,
                Type: "String",
                IsSensitive: false
            },
            {
                Key: "requestDetail",
                Language: "en",
                Value: requestDetail,
                Type: "String",
                IsSensitive: false
            },
            {
                Key: "from_user",
                Language: "en",
                Value: from_user,
                Type: "String",
                IsSensitive: false
            }
        ],
        Recipients: recipients.map(recipient => ({ RecipientId: recipient })),
    }
}

async function publishNotification(notification) {
    const notifTypes = await NotificationService.getNotificationTypes();
    const notifType = notifTypes.find(nType => nType.NotificationTypeKey === NOTIF_TYPE_KEY && nType.NotificationTypeVersion === NOTIF_TYPE_VERSION);
    if (!notifType) {
        console.log(`Notification Type of key ${NOTIF_TYPE_KEY} and version ${NOTIF_TYPE_VERSION} was not found. Creating it...`);
        await NotificationService.postNotificationType(createNotificationType());
    }
    return await NotificationService.postNotification(createNotification(notification));
}

module.exports = { publishNotification };