const cds = require('@sap/cds');
const createNoti = require('./createNotification');
const vendorNoti = require('./createVendorNotification');
module.exports = async function () {
    const db = await cds.connect.to('db')
    const {
        Roles,
        Users_Role_Assign,
        Vendor_List,
        User_Approve_Maintain,
        Pricing_Conditions,
        Vendor_Notifications,
        Pricing_Notifications,
        Vendor_Comments,
        Pricing_Comments,
        UserDetails
    } = db.entities("ferrero.mro");
    this.on("READ", "CheckUserRole", async (req, next) => {
        var result;
        var logOnUser = req.user.id.toUpperCase();
        // console.log("log on user:   " + req.user);
        if (logOnUser && logOnUser !== "") {
            try {
                result = await SELECT.from(Users_Role_Assign).where({ userid: req.user.id.toUpperCase() });
            } catch (err) {
                req.reject(500, "logon user unavailable");
            }
            return result;
        } else {
            req.reject(500, "logon user unavailable");
        }
    });
    this.before("INSERT", "PricingConditions", async (req, next) => {
        try {
            var status = "Pending";
            if (req.data.local_ownership) {
                if (req.data.local_ownership === true) {
                    status = "Forwarded";
                }
            }
            req.data.CreatedBy = req.user.id.toUpperCase();
            var result = await SELECT.from(User_Approve_Maintain).where({ userid: req.user.id.toUpperCase() });
            if (result.length > 0) {
                req.data.approver = req.data.local_ownership ? "" : result[0].managerid;
                req.data.initiator = req.user.id.toUpperCase();
                req.data.status_code = status;
                req.data.initiator = req.user.id.toUpperCase();
                req.data.uuid = cds.utils.uuid();

                if (req.data.p_notif) {
                    req.data.p_notif.Pricing_Conditions_manufacturerCode = req.data.manufacturerCode;
                    req.data.p_notif.Pricing_Conditions_countryCode_code = req.data.countryCode_code;
                    req.data.p_notif.approver = req.data.local_ownership ? "" : result[0].managerid;
                    req.data.p_notif.user = req.user.id;
                    req.data.p_notif.status_code = status;
                    req.data.p_notif.CreatedBy = req.user.id.toUpperCase();
                }
                return req;
            } else {
                req.reject(400, "Manager not assigned", "Please assign manager to the user " + req.user.id.toUpperCase());
            }
        } catch (err) {
            req.reject("500", err);
        }
    });


    this.before("INSERT", "VendorList", async (req, next) => {
        var logOnUser = req.user.id.toUpperCase();
        try {
            result = await SELECT.from(User_Approve_Maintain).where({ userid: req.user.id.toUpperCase() });
            if (result.length > 0) {
                req.data.approver = result[0].managerid;
                req.data.initiator = req.user.id.toUpperCase();
                req.data.status_code = "Pending";
                req.data.uuid = cds.utils.uuid();
                req.data.CreatedBy = req.user.id.toUpperCase();

                if (req.data.v_notif) {
                    req.data.v_notif.Vendor_List_manufacturerCode = req.data.manufacturerCode;
                    req.data.v_notif.Vendor_List_localManufacturerCode = req.data.localManufacturerCode;
                    req.data.v_notif.Vendor_List_countryCode_code = req.data.countryCode_code;
                    req.data.v_notif.approver = result[0].managerid;
                    req.data.v_notif.status_code = "Pending";
                    req.data.v_notif.CreatedBy = req.user.id.toUpperCase();
                }

                return req;
            } else {
                req.reject(400, "Manager not assigned", "Please assign manager to the user " + req.user.id.toUpperCase());
            }
        } catch (err) {
            req.reject("500", err);
        }
    });

    this.after("INSERT", "VendorList", async (req, next) => {
        try {
            result = await SELECT.from(UserDetails).where({ userid: req.approver });
            var mailId, managerid;
            if (result.length > 0) {
                managerid = result[0].managerid;
                mailId = result[0].mail_id;
                // var oManagerInfo = await SELECT.one(Users_Role_Assign).where({ userid: managerid });
            }

            await vendorNoti.mainPayload({
                requestType: "New",
                requestDetail: "Manufacturer- " + req.manufacturerCode + " & Local Manufacturer- " + req.localManufacturerCode
                    + " & Country- " + req.countryCode_code,
                from_user: req.initiator,
                recipients: [mailId],
                priority: "High"
            });
        } catch (err) {
            return err;
        }
        return req;
    });

    this.after("INSERT", "PricingConditions", async (req, next) => {
        // var finalInfo = await next();
        try {
            if (req.local_ownership) {
                // var aVal = await sendNotificationToLDT(req.data);
                var aUsers = await SELECT.from(UserDetails).where({ country: req.countryCode_code, role_role: 'LDT' });
                var aMails = [];
                if (aUsers.length > 0) {
                    for (var a of aUsers) {
                        aMails.push(a.mail_id);
                    }
                    await createNoti.mainPayload({
                        requestType: "New",
                        requestDetail: "Manufacturer- " + req.manufacturerCode + " & Country- " + req.countryCode_code,
                        from_user: req.initiator,
                        recipients: aMails,
                        priority: "High"
                    });
                } else {
                    req.reject(400, "No Local Delivery teams available for the country: " + req.countryCode_code);
                }
            } else {
                result = await SELECT.from(UserDetails).where({ userid: req.approver });
                var mailId, managerid;
                if (result.length > 0) {
                    managerid = result[0].managerid;
                    mailId = result[0].mail_id;
                    // var oManagerInfo = await SELECT.one(Users_Role_Assign).where({ userid: managerid });
                }

                await createNoti.mainPayload({
                    requestType: "New",
                    requestDetail: "Manufacturer- " + req.manufacturerCode + " & Country- " + req.countryCode_code,
                    from_user: req.initiator,
                    recipients: [mailId],
                    priority: "High"
                });
            }
        } catch (error) {
            return error;
        }
        return req;
    });

    this.before("INSERT", "VendorComments", async (req, next) => {
        var logOnUser = req.user.id.toUpperCase();
        // req.data.initiator = req.user.id.toUpperCase();
        req.data.uuid = cds.utils.uuid();
        req.data.CreatedBy = req.user.id.toUpperCase();
        return req;
    });
    this.before("INSERT", "PricingComments", async (req, next) => {
        var logOnUser = req.user.id.toUpperCase();
        // req.data.initiator = req.user.id.toUpperCase();
        req.data.uuid = cds.utils.uuid();
        req.data.CreatedBy = req.user.id.toUpperCase();
        return req;
    });



    this.on("UPDATE", "PricingNotifications", async (req, next) => {
        var PricingNotifications = await next();
        try {
            // var returnValue = "0";
            oPricingCond = await SELECT.one(Pricing_Conditions).where(
                {
                    manufacturerCode: PricingNotifications.Pricing_Conditions_manufacturerCode,
                    countryCode_code: PricingNotifications.Pricing_Conditions_countryCode_code
                }
            );
            oResult = await SELECT.one(UserDetails).where({ userid: oPricingCond.createdBy });
            var mailId, managerid;
            if (oResult) {
                mailId = oResult.mail_id;
            }

            await UPDATE(Pricing_Conditions).with({
                status_code: PricingNotifications.status_code
            }).where(
                {
                    manufacturerCode: PricingNotifications.Pricing_Conditions_manufacturerCode,
                    countryCode_code: PricingNotifications.Pricing_Conditions_countryCode_code
                }
            );

            await createNoti.mainPayload({
                requestType: "Approved",
                requestDetail: "Manufacturer- " + PricingNotifications.Pricing_Conditions_manufacturerCode + " & Country- " + PricingNotifications.Pricing_Conditions_countryCode_code,
                from_user: PricingNotifications.approver,
                recipients: [mailId],
                priority: "Low"
            });
        } catch (err) {
            req.reject(400, err);
        }
        return PricingNotifications;
    });

    this.on("UPDATE", "VendorNotifications", async (req, next) => {
        var VendorNotifications = await next();
        try {
            oVendList = await SELECT.one(Vendor_List).where(
                {
                    manufacturerCode: VendorNotifications.Vendor_List_manufacturerCode,
                    localManufacturerCode: VendorNotifications.Vendor_List_localManufacturerCode,
                    countryCode_code: VendorNotifications.Vendor_List_countryCode_code
                }
            );
            oResult = await SELECT.one(UserDetails).where({ userid: oVendList.createdBy });
            var mailId, managerid;
            if (oResult) {
                mailId = oResult.mail_id;
            }
            await UPDATE(Vendor_List).with({
                status_code: VendorNotifications.status_code
            }).where(
                {
                    manufacturerCode: VendorNotifications.Vendor_List_manufacturerCode,
                    localManufacturerCode: VendorNotifications.Vendor_List_localManufacturerCode,
                    countryCode_code: VendorNotifications.Vendor_List_countryCode_code
                }
            );

            await vendorNoti.mainPayload({
                requestType: "Approved",
                requestDetail: "Manufacturer- " + VendorNotifications.Vendor_List_manufacturerCode + " & Local Manufacturer- " + VendorNotifications.Vendor_List_localManufacturerCode
                    + " & Country- " + VendorNotifications.Vendor_List_countryCode_code,
                from_user: req.user.id.toUpperCase(),
                recipients: [mailId],
                priority: "High"
            });

        } catch (err) {
            req.reject(400, err);
        }
        return VendorNotifications;
    });

    this.on("approvePricing", async req => {
        try {
            var returnValue = "0";
            var result = await UPDATE(Pricing_Notifications).with({
                status_code: "Approved",
                approvedDate: new Date().toISOString(),
                completionDate: new Date().toISOString(),
                approver: req.user.id.toUpperCase()
            }).where({
                uuid: req.data.uuid
            });
            if (result === 1) {
                var result = await UPDATE(Pricing_Conditions).with({
                    status_code: "Approved",
                    exchangeRate: 3.3
                }).where(
                    {
                        manufacturerCode: req.data.manufacturerCode,
                        countryCode_code: req.data.countryCode_code
                    }
                );
                if (result === 0) {
                    await UPDATE(Pricing_Conditions).with({
                        status_code: "Approved",
                        exchangeRate: 3.3
                    }).where(
                        {
                            manufacturerCode: req.data.manufacturerCode,
                            countryCode_code: req.data.countryCode_code
                        }
                    );
                }
            }
            await createNoti.mainPayload({
                manufacturerCode: "Manufacturer Code: " + req.data.manufacturerCode,
                countryCode_code: "Country Code: " + req.data.countryCode_code,
                from_mail: req.user.id.toUpperCase(),
                recipients: ["SrinivasaReddy.BUTUKURI@guest.ferrero.com", "Divya.EMURI@guest.ferrero.com",
                    "butuksrin1@ferrero.com"],
                priority: "Low"
            });
            // }
            return 0;
        } catch (err) {
            req.reject(400, err);
        }
    });

    this.on("acceptPricingCond", async (req, next) => {
        var oPayLoad = await next();
        var oNotif = await SELECT.one(Pricing_Notifications).where({ uuid: req.data.uuid });
        if (oNotif.status_code !== "Forwarded") {
            req.reject(400, "User: " + oNotif.modifiedBy + " is already working on this record");
        }
        var oUser = await SELECT.one(User_Approve_Maintain).where({ userid: req.user.id.toUpperCase() });
        var result = await UPDATE(Pricing_Notifications).with({
            status_code: "In Progress",
            user: req.user.id.toUpperCase()
            // approver: oUser.managerid
        }).where({
            uuid: req.data.uuid
        });
        if (result === 1) {
            var result = await UPDATE(Pricing_Conditions).with({
                status_code: "In Progress",
                ld_initiator: req.user.id.toUpperCase()
                // ,
                // approver: oUser.managerid
            }).where(
                {
                    manufacturerCode: req.data.manufacturerCode,
                    countryCode_code: req.data.countryCode_code
                }
            );
        }
    });

    this.on("INSERT", "VendorComments", async (req, next) => {
        var VendorComments = await next();
        try {
            req.data.CreatedBy = req.user.id.toUpperCase();
            oVendList = await SELECT.one(Vendor_List).where(
                {
                    manufacturerCode: VendorComments.Vendor_List_manufacturerCode,
                    localManufacturerCode: VendorComments.Vendor_List_localManufacturerCode,
                    countryCode_code: VendorComments.Vendor_List_countryCode_code
                }
            );
            oResult = await SELECT.one(UserDetails).where({ userid: oVendList.createdBy });
            var mailId, managerid;
            if (oResult) {
                mailId = oResult.mail_id;
            }

            await UPDATE(Vendor_Notifications).with({
                status_code: "Rejected",
                approver: req.user.id.toUpperCase(),
                approvedDate: new Date().toISOString(),
                completionDate: new Date().toISOString()
            }).where(
                {
                    uuid: VendorComments.vendor_Notif_uuid
                }
            );
            await UPDATE(Vendor_List).with({
                status_code: "Rejected"
            }).where(
                {
                    manufacturerCode: VendorComments.Vendor_List_manufacturerCode,
                    localManufacturerCode: VendorComments.Vendor_List_localManufacturerCode,
                    countryCode_code: VendorComments.Vendor_List_countryCode_code
                }
            );

            await vendorNoti.mainPayload({
                requestType: "Rejected",
                requestDetail: "Manufacturer- " + VendorComments.Vendor_List_manufacturerCode + " & Local Manufacturer- " + VendorComments.Vendor_List_localManufacturerCode
                    + " & Country- " + VendorComments.Vendor_List_countryCode_code,
                from_user: req.user.id.toUpperCase(),
                recipients: [mailId],
                priority: "High"
            });
        } catch (err) {
            req.reject(400, err);
        }
        return VendorComments;
    });
    this.on("INSERT", "PricingComments", async (req, next) => {
        var PricingComments = await next();
        try {
            req.data.CreatedBy = req.user.id.toUpperCase();
            oPricingCond = await SELECT.one(Pricing_Conditions).where(
                {
                    manufacturerCode: PricingComments.Pricing_Conditions_manufacturerCode,
                    countryCode_code: PricingComments.Pricing_Conditions_countryCode_code
                }
            );
            oResult = await SELECT.one(UserDetails).where({ userid: oPricingCond.createdBy });
            var mailId, managerid;
            if (oResult) {
                mailId = oResult.mail_id;
            }

            await UPDATE(Pricing_Notifications).with({
                status_code: "Rejected",
                approver: req.user.id.toUpperCase(),
                approvedDate: new Date().toISOString(),
                completionDate: new Date().toISOString()
            }).where(
                {
                    uuid: PricingComments.pricing_Notif_uuid
                }
            );
            await UPDATE(Pricing_Conditions).with({
                status_code: "Rejected"
            }).where(
                {
                    manufacturerCode: PricingComments.Pricing_Conditions_manufacturerCode,
                    countryCode_code: PricingComments.Pricing_Conditions_countryCode_code
                }
            );

            await createNoti.mainPayload({
                requestType: "Rejected",
                requestDetail: "Manufacturer- " + PricingComments.Pricing_Conditions_manufacturerCode + " & Country- " + PricingComments.Pricing_Conditions_countryCode_code,
                from_user: req.user.id.toUpperCase(),
                recipients: [mailId],
                priority: "High"
            });
            // }
            // return 0;
        } catch (err) {
            req.reject(400, err);
        }
        return PricingComments;
    });
    this.on("batchCreateVendor", async (req, next) => {
        var oPayLoad = await next();
        try {
            if (req.data.aData) {
                for (var a of req.data.aData) {
                    try {
                        var oVend = await SELECT.one(Vendor_List).where({
                            manufacturerCode: a.manufacturerCode,
                            localManufacturerCode: a.localManufacturerCode,
                            countryCode_code: a.countryCode_code
                        });
                        if (oVend === null) {
                            var aData = await INSERT.into(Vendor_List).entries(a);
                        }
                    } catch (error) {
                        req.reject(error);
                    }
                }
            }

        } catch (error) {
            req.reject(error);
        }

    });

    this.before("UPDATE", "PricingConditions", async (req, next) => {
        try {
            if (req.data.local_ownership === true && req.data.ld_initiator === null) {
                req.data.status_code = "Forwarded";
                req.data.approver = "";
            } else {
                req.data.status_code = "Pending";
                oResult = await SELECT.one(UserDetails).where({ userid: req.user.id.toUpperCase() });
                var mailId, managerid;
                if (oResult) {
                    // mailId = oResult.mail_id;
                    var oManager = await SELECT.one(UserDetails).where({
                        userid: oResult.managerid
                    });
                    if (oManager) {
                        mailId = oManager.mail_id;
                    } else {
                        req.reject(400, "No manager assigned to the user");
                    }
                } else {
                    req.reject(400, "No manager assigned to the user");
                }
                req.data.approver = oManager.userid;
            }
        } catch (error) {
            req.reject(error);
        }
    });

    this.on("UPDATE", "PricingConditions", async (req, next) => {
        var oPricingConditions = await next();
        try {
            var sUser, status;
            if (oPricingConditions.local_ownership === true && oPricingConditions.ld_initiator !== null) {
                sUser = oPricingConditions.ld_initiator;
                status = "Pending";
            } else if (oPricingConditions.local_ownership === true && oPricingConditions.ld_initiator === null) {
                sUser = req.user.id;
                status = "Forwarded";
                var aUsers = await SELECT.from(UserDetails).where({ country: oPricingConditions.countryCode_code, role_role: 'LDT' });
                var aMails = [];
                if (aUsers.length > 0) {
                    for (var a of aUsers) {
                        aMails.push(a.mail_id);
                    }
                    await createNoti.mainPayload({
                        requestType: "New",
                        requestDetail: "Manufacturer- " + oPricingConditions.manufacturerCode + " & Country- " + oPricingConditions.countryCode_code,
                        from_user: oPricingConditions.initiator,
                        recipients: aMails,
                        priority: "High"
                    });
                    await UPDATE(Pricing_Notifications).with({
                        status_code: status,
                        approver: ""
                    }).where(
                        {
                            uuid: oPricingConditions.p_notif_uuid
                        }
                    );
                    return oPricingConditions;
                } else {
                    req.reject(400, "No Local Delivery teams available for the country: " + oPricingConditions.countryCode_code);
                }
            } else {
                sUser = req.user.id;
                status = "Pending";
            }
            oResult = await SELECT.one(UserDetails).where({ userid: sUser.toUpperCase() });
            var mailId, managerid;
            if (oResult) {
                // mailId = oResult.mail_id;
                var oManager = await SELECT.one(UserDetails).where({
                    userid: oResult.managerid
                });
                if (oManager) {
                    mailId = oManager.mail_id;
                } else {
                    req.reject(400, "No manager assigned to the user");
                }
            } else {
                req.reject(400, "No manager assigned to the user");
            }
            // oPricingConditions.status_code = status;
            oPricingConditions.approver = oResult.managerid;

            await UPDATE(Pricing_Notifications).with({
                status_code: status,
                approver: oResult.managerid

            }).where(
                {
                    uuid: oPricingConditions.p_notif_uuid
                }
            );

            await createNoti.mainPayload({
                requestType: "New",
                requestDetail: "Manufacturer- " + oPricingConditions.manufacturerCode + " & Country- " + oPricingConditions.countryCode_code,
                from_user: req.user.id.toUpperCase(),
                recipients: [mailId],
                priority: "High"
            });

        } catch (err) {
            req.reject(400, err);
        }
        return oPricingConditions;
    });

}