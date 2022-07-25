using ferrero.mro as my from '../db/data-model';

// @requires : 'authenticated-user'
// @requires : 'mrobeUser_sc'
// @(restrict : [
//     {
//         grant : 'READ',
//         to    : 'mrobeReadOnly_sc'
//     },
//     {
//         grant : ['*'],
//         to    : 'mrobeUser_sc'
//     }
// ])
service MroService @(impl : './cat-service.js') @(path : '/MroSrv') {
    // @readonly
    entity Roles @(restrict : [
        {
            grant : 'READ',
            to    : 'mrobeReadOnly_sc'
        },
        {
            grant : ['*'],
            to    : 'mrobeUser_sc'
        }
    ])                            as projection on my.Roles;

    entity Users @(restrict : [
        {
            grant : 'READ',
            to    : 'mrobeReadOnly_sc'
        },
        {
            grant : ['*'],
            to    : 'mrobeUser_sc'
        }
    ])                            as projection on my.Users_Role_Assign;

    entity MaintainApproval @(restrict : [
        {
            grant : 'READ',
            to    : 'mrobeReadOnly_sc'
        },
        {
            grant : ['*'],
            to    : 'mrobeUser_sc'
        }
    ])                            as projection on my.User_Approve_Maintain;

    entity VendorList @(restrict : [
        {
            grant : 'READ',
            to    : 'mrobeReadOnly_sc'
        },
        {
            grant : ['*'],
            to    : 'mrobeUser_sc'
        }
    ])                            as projection on my.Vendor_List order by
        modifiedAt desc;

    entity PricingConditions
                                  // @(restrict : [
                                  //     {
                                  //         grant : 'READ',
                                  //         to    : 'mrobeReadOnly_sc'
                                  //     },
                                  //     {
                                  //         grant : ['*'],
                                  //         to    : 'mrobeUser_sc'
                                  //     }
                                  // ])
                                  as projection on my.Pricing_Conditions order by
        modifiedAt desc;

    @cds.redirection.target
    entity StatusCodeList @(restrict : [
        {
            grant : 'READ',
            to    : 'mrobeReadOnly_sc'
        },
        {
            grant : ['*'],
            to    : 'mrobeUser_sc'
        }
    ])                            as projection on my.statusList;

    entity CountriesCodeList @(restrict : [
        {
            grant : 'READ',
            to    : 'mrobeReadOnly_sc'
        },
        {
            grant : ['*'],
            to    : 'mrobeUser_sc'
        }
    ])                            as projection on my.countriesCodeList;
    // entity VendorComments    as projection on my.vendorComments

    entity VendorComments @(restrict : [
        {
            grant : 'READ',
            to    : 'mrobeReadOnly_sc'
        },
        {
            grant : ['*'],
            to    : 'mrobeUser_sc'
        }
    ])                            as projection on my.Vendor_Comments;

    entity PricingComments @(restrict : [
        {
            grant : 'READ',
            to    : 'mrobeReadOnly_sc'
        },
        {
            grant : ['*'],
            to    : 'mrobeUser_sc'
        }
    ])                            as projection on my.Pricing_Comments;

    @cds.redirection.target
    entity PricingNotifications @(restrict : [
        {
            grant : 'READ',
            to    : 'mrobeReadOnly_sc'
        },
        {
            grant : ['*'],
            to    : 'mrobeUser_sc'
        }
    ])                            as projection on my.Pricing_Notifications;

    @cds.redirection.target
    entity VendorNotifications @(restrict : [
        {
            grant : 'READ',
            to    : 'mrobeReadOnly_sc'
        },
        {
            grant : ['*'],
            to    : 'mrobeUser_sc'
        }
    ])                            as projection on my.Vendor_Notifications;

    @(restrict : [{
        grant : ['*'],
        to    : 'mrobeUser_sc'
    }])
    action approvePricing(uuid : String, manufacturerCode : String, countryCode : String)         returns String;

    @(restrict : [{
        grant : ['*'],
        to    : 'mrobeUser_sc'
    }])
    action acceptPricingCond(uuid : String, manufacturerCode : String, countryCode_code : String) returns String;

    type oVendList : many {
        manufacturerCode      : String(10);
        localManufacturerCode : String(10);
        countryCode           : String(10);
    };

    action batchCreateVendor(aData : oVendList)                                                   returns String;

    @readonly
    entity CheckUserRole          as projection on my.Users_Role_Assign;

    @readonly
    entity UserDetails            as projection on my.UserDetails;

    @readonly
    entity VendorNotifications_A  as projection on my.VendorNotifications_A order by
        modifiedAt;

    @readonly
    entity VendorNotifications_U  as projection on my.VendorNotifications_U order by
        modifiedAt;

    @readonly
    entity PricingNotifications_U as
        select * from my.Pricing_Notifications
        where
               upper(createdBy)  =  upper($user)
            or upper(modifiedBy) =  upper($user)
            or status.code       in ('Forwarded')
        order by
            modifiedAt desc;

    @readonly
    entity PricingNotifications_A as
        select * from my.Pricing_Notifications
        where
            upper(approver) = upper($user)
        order by
            modifiedAt desc;


    view Status_Vendor as
        select * from my.statusList
        where
            code not in (
                'Forwarded', 'In Progress');
    // @cds.redirection.target
    // view VendorNotifications_U as
    //     select * from my.Vendor_Notifications
    //     where
    //         createdBy = upper($user)
    //     order by
    //         modifiedBy desc;

    // view VendorNotifications_A as
    //     select * from Vendor_Notifications
    //     where
    //         approver = upper($user)
    //     order by
    //         modifiedBy desc;

    type oVendNotif : many {
        manufacturerCode      : String(10);
        localManufacturerCode : String(10);
        countryCode           : String(10);
        ref_uuid              : UUID;
    };

}
