using MroService from './cat-service';

// annotate MroService.VendorList with {
//     manufacturerCode
// }

annotate MroService.VendorList with @(UI : {
    LineItem        : [
        {
            $Type                 : 'UI.DataField',
            Value                 : manufacturerCode,
            ![@UI.Importance]     : #High,
            ![@HTML5.CssDefaults] : {width : '10rem'}
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : manufacturerCodeDesc,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            ![@UI.Importance]     : #Low
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : localManufacturerCode,
            ![@HTML5.CssDefaults] : {width : '10rem'},
            ![@UI.Importance]     : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : localManufacturerCodeDesc,
            ![@UI.Importance] : #Low
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : countryCode_code,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #High
        },
        // {
        //     $Type             : 'UI.DataField',
        //     Value             : countryDesc,
        //     ![@UI.Importance] : #Low
        // },
        {
            $Type                 : 'UI.DataField',
            Value                 : status_code,
            Criticality           : status.criticality,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #High
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : initiator,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : approver,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type             : 'UI.DataField',
            Value             : createdAt,
            ![@UI.Importance] : #Low
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : createdBy,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #Low
        },
        {
            $Type             : 'UI.DataField',
            Value             : modifiedAt,
            ![@UI.Importance] : #Low
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : modifiedBy,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #Low
        }
    ],
    SelectionFields : [
        manufacturerCode,
        localManufacturerCode,
        countryCode_code,
        status_code
    ],
});


annotate MroService.PricingConditions with @(UI : {

    LineItem        : [
        {
            $Type                 : 'UI.DataField',
            Value                 : manufacturerCode,
            ![@HTML5.CssDefaults] : {width : '10rem'},
            ![@UI.Importance]     : #High
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : countryCode_code,
            ![@HTML5.CssDefaults] : {width : '10rem'},
            ![@UI.Importance]     : #High
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : lo_countryFactor,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : countryFactor,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : lo_exchangeRate,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : exchangeRate,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : localCurrency_code,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #Medium
        },
        // {
        //     $Type                 : 'UI.DataField',
        //     Value                 : local_ownership,
        //     ![@HTML5.CssDefaults] : {width : '8rem'},
        //     ![@UI.Importance]     : #High
        // },
        {
            $Type                 : 'UI.DataField',
            Value                 : status_code,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            Criticality           : status.criticality,
            ![@UI.Importance]     : #High
        },
        {
            $Type             : 'UI.DataField',
            Value             : manufacturerCodeDesc,
            ![@UI.Importance] : #Low
        },
        // {
        //     $Type             : 'UI.DataField',
        //     Value             : countryDesc,
        //     ![@UI.Importance] : #Low
        // },
        {
            $Type                 : 'UI.DataField',
            Value                 : validityStart,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : validityEnd,
            ![@HTML5.CssDefaults] : {width : '7rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : initiator,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : ld_initiator,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : approver,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : localApprover,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            ![@UI.Importance]     : #Medium
        },
        {
            $Type             : 'UI.DataField',
            Value             : createdAt,
            ![@UI.Importance] : #Low
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : createdBy,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            ![@UI.Importance]     : #Low
        },
        {
            $Type             : 'UI.DataField',
            Value             : modifiedAt,
            ![@UI.Importance] : #Low
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : modifiedBy,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            ![@UI.Importance]     : #Low
        }
    ],
    SelectionFields : [
        manufacturerCode,
        countryCode_code,
        status_code
    ],
    HiddenFilter    : [
        initiator,
        approver,
        localCurrency_name,
        localCurrency_descr
    ]
});


annotate MroService.VendorNotifications_U with @(UI : {LineItem : [
    {
        $Type             : 'UI.DataField',
        Value             : Vendor_List_manufacturerCode,
        ![@UI.Importance] : #High,
        Label             : 'Manufacturer'
    },
    {
        $Type             : 'UI.DataField',
        // Value             : Vendor_List_localManufacturerCode,
        Value             : localManufacturerCode,
        ![@UI.Importance] : #High,
        Label             : 'Local Manufacturer'
    },
    {
        $Type             : 'UI.DataField',
        Value             : Vendor_List_countryCode_code,
        ![@UI.Importance] : #High,
        Label             : 'Country'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : status_code,
        Criticality           : status.criticality,
        ![@HTML5.CssDefaults] : {width : '7rem'},
        ![@UI.Importance]     : #High
    },
    {
        $Type             : 'UI.DataField',
        Value             : createdAt,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : createdBy,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : approver,
        ![@UI.Importance] : #Medium
    }

]});

annotate MroService.VendorNotifications_A with @(UI : {LineItem : [
    {
        $Type             : 'UI.DataField',
        Value             : Vendor_List_manufacturerCode,
        ![@UI.Importance] : #High,
        Label             : 'Manufacturer'
    },
    {
        $Type             : 'UI.DataField',
        // Value             : Vendor_List_localManufacturerCode,
        Value             : localManufacturerCode,
        ![@UI.Importance] : #High,
        Label             : 'Local Manufacturer'
    },
    {
        $Type             : 'UI.DataField',
        Value             : Vendor_List_countryCode_code,
        ![@UI.Importance] : #High,
        Label             : 'Country'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : status_code,
        Criticality           : status.criticality,
        ![@HTML5.CssDefaults] : {width : '7rem'},
        ![@UI.Importance]     : #High
    },
    {
        $Type             : 'UI.DataField',
        Value             : createdAt,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : createdBy,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : approver,
        ![@UI.Importance] : #Medium
    }

]});

annotate MroService.PricingNotifications with @(UI : {LineItem : [
    {
        $Type                 : 'UI.DataField',
        Value                 : Pricing_Conditions_manufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '10rem'},
        Label                 : 'Manufacturer'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : Pricing_Conditions_countryCode_code,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '10rem'},
        Label                 : 'Country'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : status_code,
        Criticality           : status.criticality,
        ![@HTML5.CssDefaults] : {width : '7rem'},
        ![@UI.Importance]     : #High
    },
    {
        $Type             : 'UI.DataField',
        Value             : createdAt,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : approver,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : createdBy,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    }

]});

annotate MroService.PricingNotifications_U with @(UI : {LineItem : [
    {
        $Type                 : 'UI.DataField',
        Value                 : Pricing_Conditions_manufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '10rem'},
        Label                 : 'Manufacturer'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : Pricing_Conditions_countryCode_code,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '10rem'},
        Label                 : 'Country'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : status_code,
        Criticality           : status.criticality,
        ![@HTML5.CssDefaults] : {width : '7rem'},
        ![@UI.Importance]     : #High
    },
    {
        $Type             : 'UI.DataField',
        Value             : createdAt,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : approver,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : user,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : createdBy,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    }

]});

annotate MroService.PricingNotifications_A with @(UI : {LineItem : [
    {
        $Type                 : 'UI.DataField',
        Value                 : Pricing_Conditions_manufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '10rem'},
        Label                 : 'Manufacturer'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : Pricing_Conditions_countryCode_code,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '10rem'},
        Label                 : 'Country'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : status_code,
        Criticality           : status.criticality,
        ![@HTML5.CssDefaults] : {width : '7rem'},
        ![@UI.Importance]     : #High
    },
    {
        $Type             : 'UI.DataField',
        Value             : createdAt,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : approver,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : user,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : createdBy,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    }

]});
