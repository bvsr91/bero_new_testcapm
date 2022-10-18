using ferrero.mro as my from '../db/data-model';

// @requires : 'authenticated-user'
// @requires : 'mrobeUser_sc'
// @(restrict : [{
//     grant : '*',
//     to    : 'mrobeUser_sc'
// }])
service MroService @(impl : './cat-service.js') @(path : '/MroSrv') {
    // @readonly
    entity Roles             as projection on my.Roles;
    entity Users             as projection on my.Users_Role_Assign;
    entity MaintainApproval  as projection on my.User_Approve_Maintain;


    @cds.redirection.target
    entity VendorList        as projection on my.Vendor_List order by
        modifiedAt desc;

    @cds.redirection.target
    entity PricingConditions as projection on my.Pricing_Conditions order by
        modifiedAt desc;

    @cds.redirection.target
    entity StatusCodeList    as projection on my.statusList;

    entity CountriesCodeList as projection on my.countriesCodeList;
    // entity VendorComments    as projection on my.vendorComments

    entity VendorComments    as projection on my.Vendor_Comments order by
        modifiedAt desc;

    entity PricingComments   as projection on my.Pricing_Comments order by
        modifiedAt desc;

    action approvePricing(uuid : String, manufacturerCode : String, countryCode : String)                                  returns String;
    action acceptPricingCond(uuid : String, manufacturerCode : String, countryCode_code : String)                          returns String;
    action approveVendor(uuid : String, manufacturerCode : String, countryCode : String)                                   returns String;

    type oVendList : many {
        manufacturerCode      : String(10);
        localManufacturerCode : String(10);
        countryCode           : String(10);
    };

    action reopenVendor(uuid : String, manufacturerCode : String, countryCode : String, status : String, comment : String) returns String;
    action reopenPricing(uuid : String, status : String, comment : String)                                                 returns String;

    @readonly
    entity CheckUserRole     as projection on my.Users_Role_Assign;

    @readonly
    entity UserDetails       as projection on my.UserDetails;

    @readonly
    entity VendorNoti_U      as
        select * from my.Vendor_List
        where
                upper(createdBy) =  upper($user)
            and status.code      != 'Deleted'
        order by
            modifiedAt desc;

    @readonly
    entity VendorNoti_A      as
        select * from my.Vendor_List
        where
                upper(approver) =      upper($user)
            and status.code     not in (
                'Deleted', 'In Progress')
            order by
                modifiedAt desc;

    @readonly
    entity VendorNoti_SA     as
        select * from my.Vendor_List
        where
            (
                    upper(approver) =      upper($user)
                and status.code     not in (
                    'Deleted', 'In Progress')
                )
                or (
                        upper(createdBy) = upper($user)
                    and status.code      = 'In Progress'
                )
            order by
                modifiedAt desc;

    @readonly
    entity PricingNoti_CU    as
        select * from my.Pricing_Conditions
        where
                upper(createdBy) =      upper($user)
            and ld_initiator     is     null
            and status.code      not in (
                'Deleted', 'Forwarded', 'In Progress')
            order by
                modifiedAt desc;

    @readonly
    entity PricingNoti_CA    as
        select * from my.Pricing_Conditions
        where
            (
                    upper(approver) =      upper($user)
                and (
                    ld_initiator is null
                )
                and status.code     not in (
                    'Deleted', 'Forwarded', 'In Progress')
                )
                or (
                        upper(approver) = upper($user)
                    and status.code     = 'Approved'
                    and (
                           lo_countryFactor = true
                        or lo_exchangeRate  = true
                    )
                )
            order by
                modifiedAt desc;

    @readonly
    entity PricingNoti_LU    as
        select * from my.Pricing_Conditions
        where
                upper(ld_initiator) =      upper($user)
            and status.code         not in ('Deleted')
            or  status.code         =      'Forwarded'
        order by
            modifiedAt desc;

    @readonly
    entity PricingNoti_LA    as
        select * from my.Pricing_Conditions
        where
                upper(localApprover) =      upper($user)
            and status.code          not in (
                'Deleted', 'Forwarded', 'In Progress')
            order by
                modifiedAt desc;

    @readonly
    entity PricingNoti_CS    as
        select * from my.Pricing_Conditions
        where
            (
                (
                       upper(approver)  = upper($user)
                    or upper(createdBy) = upper($user)
                )
                and ld_initiator is     null
                and status.code  not in (
                    'Forwarded', 'Deleted', 'In Progress')
                )
                or (
                        upper(approver) = upper($user)
                    and status.code     = 'Approved'
                    and (
                           lo_countryFactor = true
                        or lo_exchangeRate  = true
                    )
                )
            order by
                modifiedAt desc;

    @readonly
    entity PricingNoti_LS    as
        select * from my.Pricing_Conditions
        where
            (
                    upper(localApprover) =      upper($user)
                and status.code          not in (
                    'Deleted', 'In Progress')
                )
                or (
                        upper(ld_initiator) = upper($user)
                    and status.code         = 'In Progress'
                )
                or status.code = 'Forwarded'
            order by
                modifiedAt desc;

    view Status_Vendor as
        select * from my.statusList
        where
            code not in ('Forwarded');
}

// @requires : 'authenticated-user'
// @(restrict : [{
//     grant : ['READ'],
//     to    : 'mrobeReadOnly_sc'
// }])
service MroReadService @(path : '/MroReadSrv') {
    @readonly
    entity countryFactor       as projection on my.Pricing_Conditions {
        manufacturerCode as manufacturerCode,
        countryCode.code as country,
        countryFactor    as factor
    } where status.code = 'Approved';

    @readonly
    entity exchangeRates       as projection on my.Pricing_Conditions {
        manufacturerCode   as manufacturerCode,
        localCurrency.code as currency,
        exchangeRate       as factor
    } where status.code = 'Approved';

    @readonly
    entity manufacturerDealers as projection on my.Vendor_List {
        manufacturerCode      as manufacturerCode,
        countryCode.code      as country,
        localManufacturerCode as dealerCode
    } where status.code = 'Approved';
}
