namespace ferrero.mro;

using {
    managed,
    cuid,
    Country,
    sap.common,
    sap.common.CodeList
} from '@sap/cds/common';
using {Currency} from './common';

entity Roles {
    key role        : String(3);
        description : String;
}

entity Users_Role_Assign {
    key userid  : String(30);
        role    : Association to Roles;
        mail_id : String;
        country : String(3); //mandatory for LDT and LP
}

entity User_Approve_Maintain {
    key userid    : String(30);
    key managerid : String(30);
}

entity Vendor_List : managed {
    key manufacturerCode          : String(10);
    key countryCode               : Association to countriesCodeList
                                                                    @description :     'Country'
                                                                    @Common          : {Text : 'countryCode.desc'};
    key uuid                      : UUID                            @UI.HiddenFilter : true;
        localManufacturerCode     : String(10);
        manufacturerCodeDesc      : String(35);
        localManufacturerCodeDesc : String(35);
        approver                  : String(10);
        completionDate            : Timestamp;
        status                    : Association to statusList;
}

entity Pricing_Conditions : managed {
    key manufacturerCode       : String(10);
    key countryCode            : Association to countriesCodeList;
    key uuid                   : UUID @UI.HiddenFilter : true;
        manufacturerCodeDesc   : String(35);
        localCurrency          : Currency;
        exchangeRate           : Decimal(10, 5);
        countryFactor          : Decimal(10, 5);
        validityStart          : Date;
        validityEnd            : Date;
        approver               : String(10);
        central_completionDate : Timestamp;
        local_completionDate   : Timestamp;
        ld_initiator           : String(10);
        localApprover          : String(10);
        lo_exchangeRate        : Boolean;
        lo_countryFactor       : Boolean;
        status                 : Association to statusList;
}

entity statusList : CodeList {
        @UI.Hidden       : true
        @UI.HiddenFilter : true
    key code                    : String enum {
            P = 'Pending';
            A = 'Approved';
            R = 'Rejected';
            D = 'Deleted';
            I = 'In Progress';
            F = 'Forwarded';
        } default 'Pending'; //> will be used for foreign keys as well
        criticality             : Integer; //  2: yellow colour,  3: green colour, 0: unknown
        createDeleteHidden      : Boolean;
        insertDeleteRestriction : Boolean; // = NOT createDeleteHidden
}


entity countriesCodeList {
    key code : String(3) @description : 'Country Code';
        desc : String    @description : 'Description';
}


// @cds.autoexpose
entity Vendor_Comments : managed {
    key uuid                  : UUID;
        Comment               : String;
        localManufacturerCode : String(10);
        Vendor_List           : Association to Vendor_List;
}

entity Pricing_Comments : managed {
    key uuid               : UUID;
        Comment            : String;
        Pricing_Conditions : Association to Pricing_Conditions;
}


view UserDetails as
    select
        key a.userid,
            a.mail_id,
            a.role,
            a.country,
            b.managerid
    from Users_Role_Assign as a
    inner join User_Approve_Maintain as b
        on a.userid = b.userid;
