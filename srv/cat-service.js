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
            // if (req.data.lo_exchangeRate) {
            //     if (req.data.lo_exchangeRate === true) {
            //         status = "Forwarded";
            //     }
            // }
            // if (req.data.lo_countryFactor) {
            //     if (req.data.lo_countryFactor === true) {
            //         status = "Forwarded";
            //     }
            // }

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
                req.data.initiator = req.user.id.toUpperCase();
                req.data.status_code = status;
                req.data.initiator = req.user.id.toUpperCase();
                req.data.uuid = cds.utils.uuid();

                if (req.data.p_notif) {
                    req.data.p_notif.Pricing_Conditions_manufacturerCode = req.data.manufacturerCode;
                    req.data.p_notif.Pricing_Conditions_countryCode_code = req.data.countryCode_code;
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
                req.data.approver = result[0].managerid;
                req.data.initiator = req.user.id.toUpperCase();
                req.data.status_code = "Pending";
                req.data.uuid = cds.utils.uuid();
                req.data.createdBy = req.user.id.toUpperCase();
                req.data.modifiedBy = req.user.id.toUpperCase();

                if (req.data.v_notif) {
                    req.data.v_notif.Vendor_List_manufacturerCode = req.data.manufacturerCode;
                    req.data.v_notif.localManufacturerCode = req.data.localManufacturerCode;
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
                createNoti.mainPayload({
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
        req.data.createdBy = req.user.id.toUpperCase();
        req.data.modifiedBy = req.user.id.toUpperCase();
        return req;
    });
    this.before("INSERT", "PricingComments", async (req, next) => {
        var logOnUser = req.user.id.toUpperCase();
        // req.data.initiator = req.user.id.toUpperCase();
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
                    countryCode_code: PricingNotifications.Pricing_Conditions_countryCode_code
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
                if (aUsers.length === 0) {
                    req.reject(400, "No Local Delivery teams available for the country: " + oPricingCond.countryCode_code);
                }
            }

            req.data.status_code = status !== "" ? status : req.data.status_code;
            if (status !== "") {
                req.data.approver = "";
                req.data.completionDate = null;
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
                    countryCode_code: PricingNotifications.Pricing_Conditions_countryCode_code
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
                    // await UPDATE(Pricing_Notifications).with({
                    //     status_code: status,
                    //     approver: "",
                    //     modifiedBy: req.user.id.toUpperCase()
                    // }).where(
                    //     {
                    //         uuid: oPricingCond.p_notif_uuid
                    //     }
                    // );
                    await UPDATE(Pricing_Conditions).with({
                        status_code: status,
                        modifiedBy: req.user.id.toUpperCase()
                    }).where(
                        {
                            manufacturerCode: PricingNotifications.Pricing_Conditions_manufacturerCode,
                            countryCode_code: PricingNotifications.Pricing_Conditions_countryCode_code
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
                        countryCode_code: PricingNotifications.Pricing_Conditions_countryCode_code
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
                    countryCode_code: VendorNotifications.Vendor_List_countryCode_code
                }
            );
            if (oVendList === null) {
                req.reject(400, "Record is not available in the Vendot List table for the given Manufacturer Code : "
                    + VendorNotifications.Vendor_List_manufacturerCode + " , Local Manufacturer Code : "
                    + VendorNotifications.localManufacturerCode
                    + " and  Country Code : " + VendorNotifications.Vendor_List_countryCode_code);
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

    this.on("approvePricing", async req => {
        try {
            var returnValue = "0";
            var result = await UPDATE(Pricing_Notifications).with({
                status_code: "Approved",
                approvedDate: new Date().toISOString(),
                completionDate: new Date().toISOString(),
                approver: req.user.id.toUpperCase(),
                modifiedBy: req.user.id.toUpperCase()
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
            createNoti.mainPayload({
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
                    countryCode_code: req.data.countryCode_code
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
                    // localManufacturerCode: VendorComments.localManufacturerCode,
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
            req.data.createdBy = req.user.id.toUpperCase();
            req.data.modifiedBy = req.user.id.toUpperCase();
            oPricingCond = await SELECT.one(Pricing_Conditions).where(
                {
                    manufacturerCode: PricingComments.Pricing_Conditions_manufacturerCode,
                    countryCode_code: PricingComments.Pricing_Conditions_countryCode_code
                }
            );
            if (oPricingCond.ld_initiator !== null) {
                oResult = await SELECT.one(UserDetails).where({ userid: oPricingCond.ld_initiator });
            } else {
                oResult = await SELECT.one(UserDetails).where({ userid: oPricingCond.createdBy });
            }
            var mailId, managerid;
            if (oResult) {
                mailId = oResult.mail_id;
            }

            await UPDATE(Pricing_Notifications).with({
                status_code: "Rejected",
                approver: req.user.id.toUpperCase(),
                approvedDate: new Date().toISOString(),
                completionDate: new Date().toISOString(),
                modifiedBy: req.user.id.toUpperCase()
            }).where(
                {
                    uuid: PricingComments.pricing_Notif_uuid
                }
            );
            await UPDATE(Pricing_Conditions).with({
                status_code: "Rejected",
                modifiedBy: req.user.id.toUpperCase()
            }).where(
                {
                    manufacturerCode: PricingComments.Pricing_Conditions_manufacturerCode,
                    countryCode_code: PricingComments.Pricing_Conditions_countryCode_code
                }
            );

            createNoti.mainPayload({
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
                            // localManufacturerCode: a.localManufacturerCode,
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
            var sUser = req.user.id.toUpperCase();
            req.data.modifiedBy = sUser;
            oPricing = await SELECT.one(Pricing_Conditions).where(
                {
                    manufacturerCode: req.data.manufacturerCode,
                    countryCode_code: req.data.countryCode_code
                }
            );
            if (oPricing.status_code === "Approved") {
                req.reject(400, "You can not modify/update the approved record");
            }
            var oUser = await SELECT.one(UserDetails).where({ userid: sUser });
            if (req.data.status_code !== "Deleted") {
                if (oPricing.status_code !== "Approved" && oPricing.status_code !== "Forwarded") {
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
            }
        } catch (error) {
            req.reject(error);
        }
    });

    this.on("UPDATE", "PricingConditions", async (req, next) => {
        var oPricingConditions = await next();
        try {
            var oUser = await SELECT.one(UserDetails).where({ userid: req.user.id.toUpperCase() });
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
                    countryCode_code: VendorList.countryCode_code
                }
            );
            result = await SELECT.from(UserDetails).where({ userid: oVendList.approver });
            var mailId, managerid;
            if (result.length > 0) {
                managerid = result[0].managerid;
                mailId = result[0].mail_id;
                // var oManagerInfo = await SELECT.one(Users_Role_Assign).where({ userid: managerid });
            }

            // await UPDATE(Vendor_List).with({
            //     status_code: VendorList.status_code,
            //     modifiedBy: req.user.id.toUpperCase()
            // }).where(
            //     {
            //         manufacturerCode: VendorList.manufacturerCode,
            //         countryCode_code: VendorList.countryCode_code
            //     }
            // );
            await UPDATE(Vendor_Notifications).with({
                status_code: VendorList.status_code,
                localManufacturerCode: VendorList.localManufacturerCode,
                modifiedBy: req.user.id.toUpperCase()
            }).where(
                {
                    Vendor_List_manufacturerCode: VendorList.manufacturerCode,
                    Vendor_List_countryCode_code: VendorList.countryCode_code
                }
            );

            vendorNoti.mainPayload({
                requestType: "New",
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

    // this.before("UPDATE", "PricingConditions", async (req, next) => {
    //     try {
    //         req.data.modifiedBy = req.user.id.toUpperCase();
    //         oPricing = await SELECT.one(Pricing_Conditions).where(
    //             {
    //                 manufacturerCode: req.data.manufacturerCode,
    //                 countryCode_code: req.data.countryCode_code
    //             }
    //         );
    //         if (oPricing.status_code === "Approved") {
    //             req.reject(400, "You can not modify/update the approved record");
    //         } else {
    //             return req;
    //         }
    //     } catch (err) {
    //         req.reject(400, err);
    //     }
    // });

}