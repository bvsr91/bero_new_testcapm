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
    key localManufacturerCode     : String(10);
        // @Consumption.filter.hidden : true
    key countryCode               : Association to countriesCodeList
                                                                    @description     : 'Country'
                                                                    @Common          : {Text : 'countryCode.desc'};
        uuid                      : UUID                            @UI.HiddenFilter : true;
        manufacturerCodeDesc      : String(35);
        localManufacturerCodeDesc : String(35);
        initiator                 : String(10);
        approver                  : String(10);
        // status                    : String(10);
        status                    : Association to statusList;
                                                                    @UI.Hidden       : true
                                                                    @UI.HiddenFilter : true
        v_notif                   : Composition of Vendor_Notifications;
}

entity Pricing_Conditions : managed {
    key manufacturerCode     : String(10);
    key countryCode          : Association to countriesCodeList;
        // countryDesc          : String;

        uuid                 : UUID @UI.HiddenFilter : true;
        manufacturerCodeDesc : String(35);
        localCurrency        : Currency;
        exchangeRate         : Decimal(4, 2);
        countryFactor        : Decimal(4, 2);
        validityStart        : Date;
        validityEnd          : Date;
        initiator            : String;
        approver             : String;
        ld_initiator         : String;
        local_ownership      : Boolean;
        lo_exchangeRate      : Boolean;
        lo_countryFactor     : Boolean;
        // to_status            : Association to statusList;
        // status               : String(10);
        status               : Association to statusList;
        @UI.Hidden       :                             true
        @UI.HiddenFilter :                             true
        p_notif              : Composition of Pricing_Notifications;
}

// entity statusList CodeList {{
//             key code        : String(10);
//         criticality : Integer; //  2: yellow colour,  3: green colour, 0: unknown
// }
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
    key uuid         : UUID;
        Comment      : String;
        Vendor_List  : Association to Vendor_List;
        vendor_Notif : Association to Vendor_Notifications;
}

entity Pricing_Comments : managed {
    key uuid               : UUID;
        Comment            : String;
        Pricing_Conditions : Association to Pricing_Conditions;
        pricing_Notif      : Association to Pricing_Notifications;
}

entity Pricing_Notifications : managed {
    key uuid               : UUID;
        approvedDate       : Timestamp;
        approver           : String;
        user               : String;
        status             : Association to statusList;
        completionDate     : Timestamp;
        Pricing_Conditions : Association to Pricing_Conditions;
}

entity Vendor_Notifications : managed {
    key uuid           : UUID;
        approvedDate   : Timestamp;
        approver       : String;
        completionDate : Timestamp;
        status         : Association to statusList;
        Vendor_List    : Association to Vendor_List;
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

view VendorNotifications_U as
    select * from Vendor_Notifications
    where
        upper(createdBy) = upper($user)
    order by
        modifiedAt desc;

view VendorNotifications_A as
    select * from Vendor_Notifications
    where
        upper(approver) = upper($user)
    order by
        modifiedAt desc;
