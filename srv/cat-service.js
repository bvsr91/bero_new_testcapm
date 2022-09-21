const cds = require('@sap/cds');
const createNoti = require('./createNotification');
const vendorNoti = require('./createVendorNotification');
// const types = require('./types');
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
            var aPricing = await SELECT.from(Pricing_Conditions).where(
                {
                    manufacturerCode: req.data.manufacturerCode,
                    countryCode_code: req.data.countryCode_code.toUpperCase(),
                    status_code: ['Pending', 'Forwarded', 'Approved', 'Rejected', 'In Progress']
                }
            );
            if (aPricing.length > 0) {
                req.error(400, "Record with same Manufacturer and Country are already existing in the table");
            }
            var sErrorMsg = await validatePricing(req.data);
            if (sErrorMsg !== "") {
                req.error(400, sErrorMsg);
            }

            if (req.data.lo_exchangeRate === true && req.data.lo_countryFactor === true) {
                status = "Forwarded";
            }

            req.data.createdBy = req.user.id.toUpperCase();
            req.data.modifiedBy = req.user.id.toUpperCase();
            var result = await SELECT.from(User_Approve_Maintain).where({ userid: req.user.id.toUpperCase() });
            if (result.length > 0) {
                if (req.data.lo_exchangeRate === true || req.data.lo_countryFactor === true) {
                    var aUsers = await SELECT.from(UserDetails).where({ country: req.data.countryCode_code, role_role: ['LDT', 'SLP'] });
                    if (aUsers.length === 0) {
                        req.error(400, "No Local Delivery teams available for the country: " + req.data.countryCode_code);
                    }
                }
                var sApprover;
                if (status === "Forwarded") {
                    sApprover = "";
                    req.data.approver = "";
                    req.data.loApprover = "";
                } else {
                    sApprover = result[0].managerid;
                    req.data.approver = sApprover;
                    req.data.loApprover = "";
                }
                // req.data.approver = status === "Forwarded" ? "" : result[0].managerid;
                req.data.status_code = status;
                // req.data.initiator = req.user.id.toUpperCase();
                req.data.uuid = cds.utils.uuid();

                if (req.data.p_notif) {
                    req.data.p_notif.Pricing_Conditions_manufacturerCode = req.data.manufacturerCode;
                    req.data.p_notif.Pricing_Conditions_countryCode_code = req.data.countryCode_code;
                    req.data.p_notif.Pricing_Conditions_uuid = req.data.uuid;
                    req.data.p_notif.manufacturerCodeDesc = req.data.manufacturerCodeDesc;
                    req.data.p_notif.approver = sApprover;
                    req.data.p_notif.user = req.user.id.toUpperCase();
                    req.data.p_notif.status_code = status;
                    req.data.p_notif.createdBy = req.user.id.toUpperCase();
                    req.data.p_notif.modifiedBy = req.user.id.toUpperCase();
                }
                return req;
            } else {
                req.error(400, "Please assign manager to the user " + req.user.id.toUpperCase());
            }
        } catch (err) {
            var sMsg = err.message ? err.message : err;
            req.error(sMsg);
        }
    });


    this.before("INSERT", "VendorList", async (req, next) => {
        var logOnUser = req.user.id.toUpperCase();
        try {
            result = await SELECT.from(User_Approve_Maintain).where({ userid: req.user.id.toUpperCase() });
            if (result.length > 0) {
                var aVendList = await SELECT.from(Vendor_List).where(
                    {
                        manufacturerCode: req.data.manufacturerCode,
                        countryCode_code: req.data.countryCode_code.toUpperCase(),
                        status_code: ['Pending', 'Forwarded', 'Approved', 'Rejected', 'In Progress']
                    }
                );
                if (aVendList.length > 0) {
                    req.error(400, "Record with same Manufacturer and Country are already existing in the table");
                }
                req.data.approver = result[0].managerid;
                req.data.status_code = "Pending";
                req.data.uuid = cds.utils.uuid();
                req.data.createdBy = req.user.id.toUpperCase();
                req.data.modifiedBy = req.user.id.toUpperCase();

                if (req.data.v_notif) {
                    req.data.v_notif.Vendor_List_manufacturerCode = req.data.manufacturerCode;
                    req.data.v_notif.localManufacturerCode = req.data.localManufacturerCode;
                    req.data.v_notif.manufacturerCodeDesc = req.data.manufacturerCodeDesc;
                    req.data.v_notif.Vendor_List_uuid = req.data.uuid;
                    req.data.v_notif.localManufacturerCodeDesc = req.data.localManufacturerCodeDesc;
                    req.data.v_notif.Vendor_List_countryCode_code = req.data.countryCode_code;
                    req.data.v_notif.approver = result[0].managerid;
                    req.data.v_notif.status_code = "Pending";
                    req.data.v_notif.createdBy = req.user.id.toUpperCase();
                    req.data.v_notif.modifiedBy = req.user.id.toUpperCase();
                }
                return req;
            } else {
                req.error(400, "Manager not assigned", "Please assign manager to the user " + req.user.id.toUpperCase());
            }
        } catch (err) {
            req.error("500", err);
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
            vendorNoti.mainPayload({
                requestType: "New",
                requestDetail: "Manufacturer- " + req.manufacturerCode + " & Local Manufacturer- " + req.localManufacturerCode
                    + " & Country- " + req.countryCode_code,
                from_user: req.createdBy,
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
            if (req.lo_exchangeRate === true && req.lo_countryFactor === true) {
                var aUsers = await SELECT.from(UserDetails).where({ country: req.countryCode_code, role_role: ['LDT', 'SLP'] });
                var aMails = [];
                if (aUsers.length > 0) {
                    for (var a of aUsers) {
                        aMails.push(a.mail_id);
                    }
                    createNoti.mainPayload({
                        requestType: "New",
                        requestDetail: "Manufacturer- " + req.manufacturerCode + " & Country- " + req.countryCode_code,
                        from_user: req.createdBy,
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
                createNoti.mainPayload({
                    requestType: "New",
                    requestDetail: "Manufacturer- " + req.manufacturerCode + " & Country- " + req.countryCode_code,
                    from_user: req.createdBy,
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
        req.data.uuid = cds.utils.uuid();
        req.data.createdBy = req.user.id.toUpperCase();
        req.data.modifiedBy = req.user.id.toUpperCase();
        return req;
    });
    this.before("INSERT", "PricingComments", async (req, next) => {
        var logOnUser = req.user.id.toUpperCase();
        req.data.uuid = cds.utils.uuid();
        req.data.createdBy = req.user.id.toUpperCase();
        req.data.modifiedBy = req.user.id.toUpperCase();
        return req;
    });

    this.before("UPDATE", "PricingNotifications", async (req, next) => {
        try {
            PricingNotifications = req.data;
            req.data.modifiedBy = req.user.id.toUpperCase();
            var status = "";
            oPricingCond = await SELECT.one(Pricing_Conditions).where(
                {
                    manufacturerCode: PricingNotifications.Pricing_Conditions_manufacturerCode,
                    countryCode_code: PricingNotifications.Pricing_Conditions_countryCode_code,
                    uuid: PricingNotifications.Pricing_Conditions_uuid,
                }
            );
            if (oPricingCond === null) {
                req.reject(400, "Record is not available in the Pricing Conditions table for the given Manufacturer Code : " + PricingNotifications.Pricing_Conditions_manufacturerCode
                    + " and  Country Code : " + PricingNotifications.Pricing_Conditions_countryCode_code);
            }

            if (req.data.status_code === "Approved") {
                if (oPricingCond.status_code !== "Pending") {
                    req.reject(400, "You can not approve the request which is in the " + oPricingCond.status_code + " Status");
                }
            }
            if (req.data.status_code === "Pending") {
                if (oPricingCond.status_code === "Approved") {
                    req.reject(400, "You can not update the request which is in the " + oPricingCond.status_code + " Status");
                }
            }

            if ((oPricingCond.lo_countryFactor === true || oPricingCond.lo_exchangeRate === true) && oPricingCond.ld_initiator === null) {
                sUser = req.user.id;
                status = "Forwarded";
                var aUsers = await SELECT.from(UserDetails).where({ country: oPricingCond.countryCode_code, role_role: ['LDT', 'SLP'] });
                var aMails = [];
                if (aUsers.length === 0) {
                    req.reject(400, "No Local Delivery teams available for the country: " + oPricingCond.countryCode_code);
                }
            }
            req.data.status_code = status !== "" ? status : req.data.status_code;
            if (status !== "") {
                req.data.approver = "";
                // req.data.completionDate = null;
            }
        } catch (err) {
            req.reject(400, err);
        }
    });

    this.on("UPDATE", "PricingNotifications", async (req, next) => {
        var PricingNotifications = await next();
        try {
            // var returnValue = "0";
            oPricingCond = await SELECT.one(Pricing_Conditions).where(
                {
                    manufacturerCode: PricingNotifications.Pricing_Conditions_manufacturerCode,
                    countryCode_code: PricingNotifications.Pricing_Conditions_countryCode_code,
                    uuid: PricingNotifications.Pricing_Conditions_uuid
                }
            );
            if (oPricingCond === null) {
                req.reject(400, "Record is not available in the Pricing Conditions table for the given Manufacturer Code : " + PricingNotifications.Pricing_Conditions_manufacturerCode
                    + " and  Country Code : " + PricingNotifications.Pricing_Conditions_countryCode_code);
            }
            if ((oPricingCond.lo_countryFactor === true || oPricingCond.lo_exchangeRate === true) && oPricingCond.ld_initiator === null) {
                sUser = req.user.id;
                status = "Forwarded";
                var aUsers = await SELECT.from(UserDetails).where({ country: oPricingCond.countryCode_code, role_role: ['LDT', 'SLP'] });
                var aMails = [];
                if (aUsers.length > 0) {
                    for (var a of aUsers) {
                        aMails.push(a.mail_id);
                    }
                    createNoti.mainPayload({
                        requestType: "New",
                        requestDetail: "Manufacturer- " + oPricingCond.manufacturerCode + " & Country- " + oPricingCond.countryCode_code,
                        from_user: sUser.toUpperCase(),
                        recipients: aMails,
                        priority: "High"
                    });

                    await UPDATE(Pricing_Conditions).with({
                        status_code: status,
                        modifiedBy: req.user.id.toUpperCase()
                    }).where(
                        {
                            manufacturerCode: PricingNotifications.Pricing_Conditions_manufacturerCode,
                            countryCode_code: PricingNotifications.Pricing_Conditions_countryCode_code,
                            uuid: PricingNotifications.Pricing_Conditions_uuid
                        }
                    );
                    return oPricingCond;
                } else {
                    req.reject(400, "No Local Delivery teams available for the country: " + oPricingCond.countryCode_code);
                }
            } else {
                oResult = await SELECT.one(UserDetails).where({ userid: oPricingCond.modifiedBy });
                var mailId, managerid;
                if (oResult) {
                    mailId = oResult.mail_id;
                }

                await UPDATE(Pricing_Conditions).with({
                    status_code: PricingNotifications.status_code,
                    modifiedBy: req.user.id.toUpperCase()
                }).where(
                    {
                        manufacturerCode: PricingNotifications.Pricing_Conditions_manufacturerCode,
                        countryCode_code: PricingNotifications.Pricing_Conditions_countryCode_code,
                        uuid: PricingNotifications.Pricing_Conditions_uuid
                    }
                );

                createNoti.mainPayload({
                    requestType: "Approved",
                    requestDetail: "Manufacturer- " + PricingNotifications.Pricing_Conditions_manufacturerCode + " & Country- " + PricingNotifications.Pricing_Conditions_countryCode_code,
                    from_user: PricingNotifications.approver,
                    recipients: [mailId],
                    priority: "Low"
                });
            }
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
                    // localManufacturerCode: VendorNotifications.localManufacturerCode,
                    uuid: VendorNotifications.Vendor_List_uuid,
                    countryCode_code: VendorNotifications.Vendor_List_countryCode_code
                }
            );
            if (oVendList === null) {
                req.reject(400, "Record is not available in the Vendot List table for the given Manufacturer Code : "
                    + VendorNotifications.Vendor_List_manufacturerCode + " , Local Manufacturer Code : "
                    + VendorNotifications.localManufacturerCode
                    + " and  Country Code : " + VendorNotifications.Vendor_List_countryCode_code);
            }
            if (oVendList.status_code === "Approved" || oVendList.status_code === "Deleted") {
                if (oVendList.status_code !== "Pending") {
                    req.reject(400, "You can not approve the request which is in the " + oVendList.status_code + " Status");
                }
            }
            oResult = await SELECT.one(UserDetails).where({ userid: oVendList.createdBy });
            var mailId, managerid;
            if (oResult) {
                mailId = oResult.mail_id;
            }
            await UPDATE(Vendor_List).with({
                status_code: VendorNotifications.status_code,
                modifiedBy: req.user.id.toUpperCase()
            }).where(
                {
                    manufacturerCode: VendorNotifications.Vendor_List_manufacturerCode,
                    // localManufacturerCode: VendorNotifications.localManufacturerCode,
                    uuid: VendorNotifications.Vendor_List_uuid,
                    countryCode_code: VendorNotifications.Vendor_List_countryCode_code
                }
            );

            vendorNoti.mainPayload({
                requestType: "Approved",
                requestDetail: "Manufacturer- " + VendorNotifications.Vendor_List_manufacturerCode + " & Local Manufacturer- " + VendorNotifications.localManufacturerCode
                    + " & Country- " + VendorNotifications.Vendor_List_countryCode_code,
                from_user: req.user.id.toUpperCase(),
                recipients: [mailId],
                priority: "Low"
            });

        } catch (err) {
            req.reject(400, err);
        }
        return VendorNotifications;
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
            user: req.user.id.toUpperCase(),
            modifiedBy: req.user.id.toUpperCase()
            // approver: oUser.managerid
        }).where({
            uuid: req.data.uuid
        });
        if (result === 1) {
            var result = await UPDATE(Pricing_Conditions).with({
                status_code: "In Progress",
                ld_initiator: req.user.id.toUpperCase(),
                modifiedBy: req.user.id.toUpperCase()
                // ,
                // approver: oUser.managerid
            }).where(
                {
                    manufacturerCode: req.data.manufacturerCode,
                    countryCode_code: req.data.countryCode_code,
                    uuid: oNotif.Pricing_Conditions_uuid
                }
            );
        }
    });

    this.on("INSERT", "VendorComments", async (req, next) => {
        var VendorComments = await next();
        try {
            req.data.createdBy = req.user.id.toUpperCase();
            req.data.modifiedBy = req.user.id.toUpperCase();
            oVendList = await SELECT.one(Vendor_List).where(
                {
                    manufacturerCode: VendorComments.Vendor_List_manufacturerCode,
                    uuid: VendorComments.Vendor_List_uuid,
                    // localManufacturerCode: VendorComments.localManufacturerCode,
                    countryCode_code: VendorComments.Vendor_List_countryCode_code
                }
            );
            if (oVendList.status_code === "Approved" || oVendList.status_code === "Deleted") {
                if (oVendList.status_code !== "Pending") {
                    req.reject(400, "You can not reject the request which is in the " + oVendList.status_code + " Status");
                }
            }
            oResult = await SELECT.one(UserDetails).where({ userid: oVendList.createdBy });
            var mailId, managerid;
            if (oResult) {
                mailId = oResult.mail_id;
            }

            await UPDATE(Vendor_Notifications).with({
                status_code: "Rejected",
                approver: req.user.id.toUpperCase(),
                approvedDate: new Date().toISOString(),
                completionDate: new Date().toISOString(),
                modifiedBy: req.user.id.toUpperCase()
            }).where(
                {
                    uuid: VendorComments.vendor_Notif_uuid
                }
            );
            await UPDATE(Vendor_List).with({
                status_code: "Rejected",
                modifiedBy: req.user.id.toUpperCase()
            }).where(
                {
                    manufacturerCode: VendorComments.Vendor_List_manufacturerCode,
                    // localManufacturerCode: VendorComments.localManufacturerCode,
                    uuid: VendorComments.Vendor_List_uuid,
                    countryCode_code: VendorComments.Vendor_List_countryCode_code
                }
            );

            vendorNoti.mainPayload({
                requestType: "Rejected",
                requestDetail: "Manufacturer- " + VendorComments.Vendor_List_manufacturerCode + " & Local Manufacturer- " + VendorComments.localManufacturerCode
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
            var sUser = req.user.id.toUpperCase();
            req.data.createdBy = sUser;
            req.data.modifiedBy = sUser;
            oPricingCond = await SELECT.one(Pricing_Conditions).where(
                {
                    manufacturerCode: PricingComments.Pricing_Conditions_manufacturerCode,
                    countryCode_code: PricingComments.Pricing_Conditions_countryCode_code,
                    uuid: PricingComments.Pricing_Conditions_uuid
                }
            );
            if (oPricingCond.status_code !== "Pending") {
                req.reject(400, "You can not reject the request which is in the " + oPricingCond.status_code + " Status");
            }

            if (oPricingCond.ld_initiator !== null) {
                oResult = await SELECT.one(UserDetails).where({ userid: oPricingCond.ld_initiator });
            } else {
                oResult = await SELECT.one(UserDetails).where({ userid: oPricingCond.createdBy });
            }
            var mailId, managerid;
            if (oResult) {
                mailId = oResult.mail_id;
            }
            var oCurrentUser = await SELECT.one(UserDetails).where({ userid: sUser });
            if (oCurrentUser.role_role === "GCM" || oCurrentUser.role_role === "SGC") {
                await UPDATE(Pricing_Notifications).with({
                    status_code: "Rejected",
                    approver: sUser,
                    approvedDate: new Date().toISOString(),
                    completionDate: new Date().toISOString(),
                    modifiedBy: sUser
                }).where(
                    {
                        uuid: PricingComments.pricing_Notif_uuid
                    }
                );
            } else if (oCurrentUser.role_role === "LP" || oCurrentUser.role_role === "SLP") {
                await UPDATE(Pricing_Notifications).with({
                    status_code: "Rejected",
                    approver: sUser,
                    approvedDate: new Date().toISOString(),
                    local_completionDate: new Date().toISOString(),
                    modifiedBy: sUser
                }).where(
                    {
                        uuid: PricingComments.pricing_Notif_uuid
                    }
                );
            }

            await UPDATE(Pricing_Conditions).with({
                status_code: "Rejected",
                modifiedBy: sUser
            }).where(
                {
                    manufacturerCode: PricingComments.Pricing_Conditions_manufacturerCode,
                    countryCode_code: PricingComments.Pricing_Conditions_countryCode_code,
                    uuid: PricingComments.Pricing_Conditions_uuid
                }
            );

            createNoti.mainPayload({
                requestType: "Rejected",
                requestDetail: "Manufacturer- " + PricingComments.Pricing_Conditions_manufacturerCode + " & Country- " + PricingComments.Pricing_Conditions_countryCode_code,
                from_user: sUser,
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
    this.on("reopenVendor", async (req, next) => {
        var oPayLoad = await next();
        try {
            var sUser = req.user.id.toUpperCase();
            var oUser = await SELECT.one(UserDetails).where({ userid: sUser });
            if (oUser && (oUser.role_role === "GCM" || oUser.role_role === "SGC")) {
                var oVendNoti = await SELECT.one(Vendor_Notifications).where({
                    uuid: req.data.notif_uuid
                });
                if (oVendNoti) {
                    var oVend = await SELECT.one(Vendor_List).where({
                        manufacturerCode: oVendNoti.Vendor_List_manufacturerCode,
                        countryCode_code: oVendNoti.Vendor_List_countryCode_code,
                        uuid: oVendNoti.Vendor_List_uuid,
                        status_code: "Approved"
                    });
                    if (oVend && oVend.approver === sUser) {
                        var result = await UPDATE(Vendor_Notifications).with({
                            status_code: req.data.status,
                            modifiedBy: req.user.id.toUpperCase()
                        }).where({
                            uuid: req.data.notif_uuid
                        });
                        if (result === 1) {
                            var result = await UPDATE(Vendor_List).with({
                                status_code: req.data.status,
                                modifiedBy: req.user.id.toUpperCase()
                            }).where(
                                {
                                    manufacturerCode: oVendNoti.Vendor_List_manufacturerCode,
                                    countryCode_code: oVendNoti.Vendor_List_countryCode_code,
                                    uuid: oVendNoti.Vendor_List_uuid
                                }
                            );
                            var oMail = await SELECT.one(UserDetails).where({ userid: oVend.createdBy });
                            if (oMail && oMail.mail_id !== "") {
                                vendorNoti.mainPayload({
                                    requestType: "Reopen Vendor Request: Status " + req.data.status + ", ",
                                    requestDetail: "Manufacturer- " + oVendNoti.Vendor_List_manufacturerCode + " & Local Manufacturer- " + oVendNoti.localManufacturerCode
                                        + " & Country- " + oVendNoti.Vendor_List_countryCode_code,
                                    from_user: sUser,
                                    recipients: [oMail.mail_id],
                                    priority: "Medium"
                                });
                            }
                        }
                    } else {
                        req.reject(400, "You are not authorized to reopen the request");
                    }
                } else {
                    req.reject(400, "No record found with the given data");
                }
            } else {
                req.reject(400, "You are not authorized to reopen the request");
            }
        } catch (error) {
            req.reject(error);
        }
    });

    this.before("UPDATE", "PricingConditions", async (req, next) => {
        try {
            var sUser = req.user.id.toUpperCase();
            // var sUser = "PRIYAJANB1";
            req.data.modifiedBy = sUser;
            var oUser = await SELECT.one(UserDetails).where({ userid: sUser });
            oPricing = await SELECT.one(Pricing_Conditions).where(
                {
                    manufacturerCode: req.data.manufacturerCode,
                    countryCode_code: req.data.countryCode_code,
                    uuid: req.data.uuid
                }
            );
            if (oPricing.status_code === "Approved") {
                req.reject(400, "You can not modify/update the approved record");
            }
            if (oPricing.status_code === "Forwarded" && oPricing.ld_initiator === null) {
                if (!(oPricing.lo_exchangeRate === true && oPricing.lo_countryFactor === true && req.data.status_code === "Pending"
                    && (oUser.role_role === "CDT" || oUser.role_role === "SGC"))) {
                    // && oPricing.createdBy === sUser)) {
                    req.reject(400, "You can not modify/update this record");
                }
            }

            if (req.data.status_code !== "Deleted") {
                if (oPricing.status_code !== "Approved") {
                    if ((req.data.lo_exchangeRate === true && req.data.lo_countryFactor === true) && req.data.ld_initiator === null && (oUser.role_role === "CDT" || oUser.role_role === "SGC")) {
                        req.data.status_code = "Forwarded";
                        // req.data.approver = "";
                        var aUsers = await SELECT.from(UserDetails).where({ country: req.data.countryCode_code, role_role: ['LDT', 'SLP'] });
                        if (aUsers.length === 0) {
                            req.error(400, "No Local Delivery teams available for the country code: " + req.data.countryCode_code);
                        }
                    } else {
                        req.data.status_code = "Pending";
                        var mailId, managerid;
                        if (oUser) {
                            var oManager = await SELECT.one(UserDetails).where({
                                userid: oUser.managerid
                            });
                            if (!oManager) {
                                req.error(400, "No manager assigned to the user");
                            }
                            if (oUser.role_role === "LDT" || oUser.role_role === "SLP") {
                                req.data.localApprover = oUser.managerid;
                            } else {
                                req.data.approver = oManager.userid;
                            }
                        } else {
                            req.error(400, "No manager assigned to the user");
                        }
                    }
                }
            } else {
                if (oUser.role_role === "LDT" || oUser.role_role === "SLP") {
                    req.error(400, "Local Team is not authorized to Delete the request");
                }
            }
            return req;
        } catch (error) {
            req.reject(error);
        }
    });

    this.on("UPDATE", "PricingConditions", async (req, next) => {
        var oPricingConditions = await next();
        try {
            var oUser = await SELECT.one(UserDetails).where({ userid: req.user.id.toUpperCase() });
            oPricingMain = await SELECT.one(Pricing_Conditions).where(
                {
                    manufacturerCode: oPricingConditions.manufacturerCode,
                    countryCode_code: oPricingConditions.countryCode_code,
                    uuid: oPricingConditions.uuid
                }
            );
            if (req.data.status_code !== "Deleted") {
                if (oPricingConditions.status_code !== "Deleted") {
                    var sUser, status;
                    if ((oPricingConditions.lo_exchangeRate === true || req.data.lo_countryFactor === true)
                        && oPricingConditions.ld_initiator !== null) {
                        sUser = oPricingConditions.ld_initiator;
                        status = "Pending";
                    } else if ((oPricingConditions.lo_exchangeRate === true && oPricingConditions.lo_countryFactor === true)
                        && oPricingConditions.ld_initiator === null && (oUser.role_role === "CDT" || oUser.role_role === "SGC")) {
                        sUser = req.user.id.toUpperCase();
                        status = "Forwarded";
                        var aUsers = await SELECT.from(UserDetails).where({ country: oPricingConditions.countryCode_code, role_role: ['LDT', 'SLP'] });
                        var aMails = [];
                        if (aUsers.length > 0) {
                            for (var a of aUsers) {
                                aMails.push(a.mail_id);
                            }
                            createNoti.mainPayload({
                                requestType: "New",
                                requestDetail: "Manufacturer- " + oPricingConditions.manufacturerCode + " & Country- " + oPricingConditions.countryCode_code,
                                from_user: sUser.toUpperCase(),
                                recipients: aMails,
                                priority: "High"
                            });
                            await UPDATE(Pricing_Notifications).with({
                                status_code: status,
                                manufacturerCodeDesc: oPricingConditions.manufacturerCodeDesc,
                                approver: "",
                                modifiedBy: req.user.id.toUpperCase()
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
                        approver: oResult.managerid,
                        manufacturerCodeDesc: oPricingConditions.manufacturerCodeDesc,
                        modifiedBy: req.user.id.toUpperCase()
                    }).where(
                        {
                            uuid: oPricingConditions.p_notif_uuid
                        }
                    );
                    createNoti.mainPayload({
                        requestType: "Updated",
                        requestDetail: "Manufacturer- " + oPricingConditions.manufacturerCode + " & Country- " + oPricingConditions.countryCode_code,
                        from_user: req.user.id.toUpperCase(),
                        recipients: [mailId],
                        priority: "High"
                    });
                }
            } else {
                await UPDATE(Pricing_Notifications).with({
                    status_code: "Deleted",
                    modifiedBy: req.user.id.toUpperCase()
                }).where(
                    {
                        uuid: oPricingConditions.p_notif_uuid
                    }
                );
                var sManager = "";
                if (oPricingMain.loApprover) {
                    sManager = oPricingMain.loApprover;
                } else {
                    sManager = oPricingMain.approver;
                }
                oResult = await SELECT.one(UserDetails).where({ userid: sManager });
                if (oResult) {
                    createNoti.mainPayload({
                        requestType: "Deleted",
                        requestDetail: "Manufacturer- " + oPricingMain.manufacturerCode + " & Country- " + oPricingMain.countryCode_code,
                        from_user: req.user.id.toUpperCase(),
                        recipients: [oResult.mail_id],
                        priority: "High"
                    });
                }
            }

        } catch (err) {
            req.reject(400, err);
        }
        return oPricingConditions;
    });

    this.on("countryFactor", async (req, next) => {
        try {
            aData = await SELECT.from(Pricing_Conditions).columns('manufacturerCode', 'countryCode_code', 'countryFactor');
            var aFinal = [];
            var countryFactors = [];
            var oCountryFactor = {};
            if (aData.length > 0) {
                for (var a of aData) {
                    oCountryFactor.manufacturerCode = a.manufacturerCode;
                    oCountryFactor.country = a.countryCode_code;
                    oCountryFactor.factor = a.countryFactor;
                    countryFactors.push(oCountryFactor)
                }
            }
        } catch (error) {
            req.reject(error);
        }
        return countryFactors;
    });

    this.before("UPDATE", "VendorList", async (req, next) => {
        try {
            req.data.modifiedBy = req.user.id.toUpperCase();
            oVendList = await SELECT.one(Vendor_List).where(
                {
                    manufacturerCode: req.data.manufacturerCode,
                    countryCode_code: req.data.countryCode_code
                }
            );
            if (oVendList.status_code === "Approved") {
                req.reject(400, "You can not modify/update the approved record");
            } else {
                return req;
            }
        } catch (err) {
            req.reject(400, err);
        }
    });

    this.on("UPDATE", "VendorList", async (req, next) => {
        var VendorList = await next();
        try {
            oVendList = await SELECT.one(Vendor_List).where(
                {
                    manufacturerCode: VendorList.manufacturerCode,
                    countryCode_code: VendorList.countryCode_code,
                    uuid: VendorList.uuid
                }
            );
            result = await SELECT.from(UserDetails).where({ userid: oVendList.approver });
            var mailId, managerid;
            if (result.length > 0) {
                managerid = result[0].managerid;
                mailId = result[0].mail_id;
            }
            await UPDATE(Vendor_Notifications).with({
                status_code: VendorList.status_code,
                localManufacturerCode: VendorList.localManufacturerCode,
                localManufacturerCodeDesc: VendorList.localManufacturerCodeDesc,
                modifiedBy: req.user.id.toUpperCase()
            }).where(
                {
                    Vendor_List_manufacturerCode: VendorList.manufacturerCode,
                    Vendor_List_uuid: VendorList.uuid,
                    Vendor_List_countryCode_code: VendorList.countryCode_code
                }
            );
            vendorNoti.mainPayload({
                requestType: VendorList.status_code === "Deleted" ? "Deleted" : "Updated",
                requestDetail: "Manufacturer- " + VendorList.manufacturerCode + " & Local Manufacturer- " + VendorList.localManufacturerCode
                    + " & Country- " + VendorList.countryCode_code,
                from_user: req.user.id.toUpperCase(),
                recipients: [mailId],
                priority: "High"
            });

        } catch (err) {
            req.reject(400, err);
        }
        return VendorList;
    });

    this.on("reopenPricing", async (req, next) => {
        var oPayLoad = await next();
        try {
            var sStatus = req.data.status,
                sForwardUser = ""
            var sUser = req.user.id.toUpperCase();
            var oUser = await SELECT.one(UserDetails).where({ userid: sUser });
            if (oUser && (oUser.role_role === "GCM" || oUser.role_role === "SGC" || oUser.role_role === "LP" || oUser.role_role === "SLP")) {
                var oPricingNoti = await SELECT.one(Pricing_Notifications).where({
                    uuid: req.data.notif_uuid
                });
                if (oPricingNoti) {
                    var oPricing = await SELECT.one(Pricing_Conditions).where({
                        manufacturerCode: oPricingNoti.Pricing_Conditions_manufacturerCode,
                        countryCode_code: oPricingNoti.Pricing_Conditions_countryCode_code,
                        uuid: oPricingNoti.Pricing_Conditions_uuid,
                        status_code: "Approved"
                    });
                    if (oPricing) {
                        if (oPricing.localApprover !== null && oPricing.localApprover === sUser && (oUser.role_role === "LP" || oUser.role_role === "SLP")) {
                            sStatus = sStatus === "Pending" ? "In Progress" : sStatus;
                            sForwardUser = oPricing.ld_initiator;
                        } else if (oPricing.localApprover === null && oPricing.approver === sUser) {
                            sForwardUser = oPricing.createdBy;
                        } else {
                            req.reject(400, "You are not authorized to reopen the request");
                        }

                        var result = await UPDATE(Pricing_Notifications).with({
                            status_code: sStatus,
                            modifiedBy: req.user.id.toUpperCase()
                        }).where({
                            uuid: req.data.notif_uuid
                        });
                        if (result === 1) {
                            var result = await UPDATE(Pricing_Conditions).with({
                                status_code: sStatus,
                                modifiedBy: req.user.id.toUpperCase()
                            }).where(
                                {
                                    manufacturerCode: oPricingNoti.Pricing_Conditions_manufacturerCode,
                                    countryCode_code: oPricingNoti.Pricing_Conditions_countryCode_code,
                                    uuid: oPricingNoti.Pricing_Conditions_uuid
                                }
                            );
                            var oMail = await SELECT.one(UserDetails).where({ userid: sForwardUser.toUpperCase() });
                            if (oMail && oMail.mail_id !== "") {
                                createNoti.mainPayload({
                                    requestType: "Reopen Pricing Request: " + sStatus + ", ",
                                    requestDetail: "Manufacturer- " + oPricingNoti.Pricing_Conditions_manufacturerCode + " & Country- " + oPricingNoti.Pricing_Conditions_countryCode_code,
                                    from_user: sUser,
                                    recipients: [oMail.mail_id],
                                    priority: "Medium"
                                });
                            }
                        }
                    } else {
                        req.reject(400, "You are not authorized to reopen the request");
                    }
                } else {
                    req.reject(400, "No record found with the given data");
                }
            } else {
                req.reject(400, "You are not authorized to reopen the request");
            }
        } catch (error) {
            req.reject(error);
        }
    });

    async function validatePricing(oReq) {
        var bFinalValidation = true, sFinalMsg = "";
        if (!oReq.lo_exchangeRate) {
            if ((oReq.exchangeRate === null || oReq.exchangeRate === "") || (oReq.localCurrency_code === "" || oReq.localCurrency_code === null)) {
                bFinalValidation = false;
                sFinalMsg = prepareErrorMsg(sFinalMsg, "Exchange Rate and Local Currency are mandatory when Local Ownership for ExchangeRate is not checked");
            }
        }
        if (!oReq.lo_countryFactor) {
            if (oReq.countryFactor === "" || oReq.countryFactor === null) {
                bFinalValidation = false;
                sFinalMsg = prepareErrorMsg(sFinalMsg, "Country Factor is mandatory when Local Ownership for Country Factor is not checked");
            }
        }
        var bValidEndDate = validateStartEndDate(oReq.validityStart, oReq.validityEnd);
        if (bValidEndDate === "1") {
            bFinalValidation = false;
            sFinalMsg = prepareErrorMsg(sFinalMsg, "Validity End date must greater than Start date");
        } else if (bValidEndDate === "2") {
            bFinalValidation = false;
            sFinalMsg = prepareErrorMsg(sFinalMsg, "Validity Start and End Date are mandatory");
        }
        return sFinalMsg;
    }
    function prepareErrorMsg(sFinalMsg, sMsg) {
        if (sFinalMsg !== "") {
            sFinalMsg = sFinalMsg + ", " + sMsg;
        } else {
            sFinalMsg = sMsg;
        }
        return sFinalMsg;
    }

    function validateStartEndDate(startDate, endDate) {
        if ((startDate || startDate !== null) && (endDate || endDate !== null)) {
            if (new Date(endDate) > new Date(startDate)) {
                return "0";
            } else {
                return "1";
            }
        } else {
            return "2";
        }
    }

}