using ferrero.mro as my from '../db/data-model';

// @requires : 'authenticated-user'
// @requires : 'mrobeUser_sc'
@(restrict : [{
    grant : 'READ',
    to    : 'mrobeReadOnly_sc'
}])
service MroService @(impl : './cat-service.js') @(path : '/MroSrv') {
    // @readonly
    entity Roles                  as projection on my.Roles;
    entity Users                  as projection on my.Users_Role_Assign;
    entity MaintainApproval       as projection on my.User_Approve_Maintain;

    entity VendorList             as projection on my.Vendor_List order by
        modifiedAt desc;

    @cds.redirection.target
    entity PricingConditions      as projection on my.Pricing_Conditions order by
        modifiedAt desc;

    @cds.redirection.target
    entity StatusCodeList         as projection on my.statusList;

    entity CountriesCodeList      as projection on my.countriesCodeList;
    // entity VendorComments    as projection on my.vendorComments

    entity VendorComments         as projection on my.Vendor_Comments;
    entity PricingComments        as projection on my.Pricing_Comments;

    @cds.redirection.target
    entity PricingNotifications   as projection on my.Pricing_Notifications;

    @cds.redirection.target
    entity VendorNotifications    as projection on my.Vendor_Notifications;

    action   approvePricing(uuid : String, manufacturerCode : String, countryCode : String)         returns String;
    action   acceptPricingCond(uuid : String, manufacturerCode : String, countryCode_code : String) returns String;

    type oVendList : many {
        manufacturerCode      : String(10);
        localManufacturerCode : String(10);
        countryCode           : String(10);
    };

    action   batchCreateVendor(aData : oVendList)                                                   returns String;

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

    type oCountryFactor : many {
        manufacturerCode : String(10);
        country          : String(10);
        factor           : String;
    };

    type countryFactors : {
        countryFactors : oCountryFactor;
    }

    function countryFactor_1()                                                                      returns oCountryFactor;


}

// @(restrict : [{
//     grant : ['*'],
//     to    : 'mrobeReadOnly_sc'
// }])
service MroReadService @(path : '/MroReadSrv') {
    @readonly
    entity countryFactor       as projection on my.Pricing_Conditions {
        manufacturerCode as manufacturerCode,
        countryCode      as country,
        countryFactor    as factor
    } where status.code = 'Approved';

    @readonly
    entity exchangeRates       as projection on my.Pricing_Conditions {
        manufacturerCode as manufacturerCode,
        localCurrency    as currency,
        countryFactor    as factor
    } where status.code = 'Approved';

    @readonly
    entity manufacturerDealers as projection on my.Vendor_List {
        manufacturerCode      as manufacturerCode,
        countryCode           as country,
        localManufacturerCode as dealerCode
    } where status.code = 'Approved';
}
