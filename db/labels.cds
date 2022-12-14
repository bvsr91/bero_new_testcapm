using {ferrero.mro as schema} from './data-model';

annotate schema.Vendor_List {
    manufacturerCode          @title           : '{i18n>manufacturerCode}'; // @Common.Text      : manufacturerCodeDesc;
    manufacturerCodeDesc      @title           : '{i18n>manufacturerCodeDesc}';
    countryCode               @title           : '{i18n>countryCode_code}'  @Common.Text : countryCode.desc;
    // countryDesc               @title           : '{i18n>countryDesc}'  @UI.HiddenFilter       : true  @UI.Hidden : true;
    localManufacturerCode     @title           : '{i18n>localManufacturerCode}'; // @Common.Text : localManufacturerCodeDesc;
    localManufacturerCodeDesc @title           : '{i18n>localManufacturerCodeDesc}';
    approver                  @title           : '{i18n>approver}'  @UI.HiddenFilter     : true;
    completionDate            @title           : '{i18n>completionDate}';
    status                    @title           : '{i18n>status}';
    uuid                      @UI.HiddenFilter : true;
}

// annotate schema.countriesCodeList with {
//     code @Common.Text : desc  @Common.TextArrangement : #TextOnly
// }

annotate schema.Pricing_Conditions {
    manufacturerCode       @title           : '{i18n>manufacturerCode}'; // @Common.Text : manufacturerCodeDesc;
    manufacturerCodeDesc   @title           : '{i18n>manufacturerCodeDesc}';
    countryCode            @title           : '{i18n>countryCode}'  @Common.Text       : countryCode.desc;
    // countryDesc          @title : '{i18n>countryDesc}'  @UI.HiddenFilter  : true  @UI.Hidden : true;
    uuid                   @UI.HiddenFilter : true;
    localCurrency          @title           : '{i18n>localCurrency}';
    exchangeRate           @title           : '{i18n>exchangeRate}';
    countryFactor          @title           : '{i18n>countryFactor}';
    validityStart          @title           : '{i18n>validityStart}';
    validityEnd            @title           : '{i18n>validityEnd}';
    ld_initiator           @title           : '{i18n>ld_initiator}';
    approver               @title           : '{i18n>approver}'  @UI.HiddenFilter      : true;
    central_completionDate @title           : '{i18n>central_completionDate}';
    local_completionDate   @title           : '{i18n>local_completionDate}';
    localApprover          @title           : '{i18n>localApprover}'  @UI.HiddenFilter : true;
    status                 @title           : '{i18n>status}';
    // local_ownership      @title           : '{i18n>local_ownership}';
    lo_exchangeRate        @title           : '{i18n>lo_exchangeRate}';
    lo_countryFactor       @title           : '{i18n>lo_countryFactor}';
}

annotate schema.Roles {
    role        @title : '{i18n>role}';
    description @title : '{i18n>description}';
}

annotate schema.Users_Role_Assign {
    userid @title : '{i18n>userid}';
    role   @title : '{i18n>role}';
}

annotate schem.User_Approve_Maintain {
    userid    @title : '{i18n>userid}';
    managerid @title : '{i18n>managerid}';
}

annotate schema.countriesCodeList {
    code @title : '{i18n>countryCode}';
    desc @title : '{i18n>desc}';
}
