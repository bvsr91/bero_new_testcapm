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
            ![@UI.Importance]     : #High
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
            ![@UI.Importance] : #High
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
            Value                 : manufacturerCodeDesc,
            ![@HTML5.CssDefaults] : {width : '8rem'},
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
        {
            $Type                 : 'UI.DataField',
            Value                 : status_code,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            Criticality           : status.criticality,
            ![@UI.Importance]     : #High
        },
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
            Value                 : createdBy,
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
            $Type             : 'UI.DataField',
            Value             : modifiedAt,
            ![@UI.Importance] : #Low
        },
        {
            $Type                 : 'UI.DataField',
            Value                 : modifiedBy,
            ![@HTML5.CssDefaults] : {width : '8rem'},
            ![@UI.Importance]     : #Low
        },
        {
            $Type             : 'UI.DataField',
            Value             : central_completionDate,
            ![@UI.Importance] : #Medium
        },
        {
            $Type             : 'UI.DataField',
            Value             : local_completionDate,
            ![@UI.Importance] : #Medium
        }
    ],
    SelectionFields : [
        manufacturerCode,
        countryCode_code,
        status_code
    ],
    HiddenFilter    : [
        approver,
        localCurrency_name,
        localCurrency_descr
    ]
});

annotate MroService.PricingNoti_CU with @(UI : {LineItem : [
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '10rem'},
        Label                 : 'Manufacturer'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCodeDesc,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'},
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : countryCode_code,
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
        Value             : central_completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : local_completionDate,
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
        Value                 : localApprover,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : modifiedBy,
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

annotate MroService.PricingNoti_CA with @(UI : {LineItem : [
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '10rem'},
        Label                 : 'Manufacturer'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCodeDesc,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'},
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : countryCode_code,
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
        Value             : central_completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : local_completionDate,
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
        Value                 : localApprover,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : modifiedBy,
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

annotate MroService.PricingNoti_LU with @(UI : {LineItem : [
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '10rem'},
        Label                 : 'Manufacturer'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCodeDesc,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'},
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : countryCode_code,
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
        Value             : central_completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : local_completionDate,
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
        Value                 : localApprover,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : modifiedBy,
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

annotate MroService.PricingNoti_LA with @(UI : {LineItem : [
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '10rem'},
        Label                 : 'Manufacturer'
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCodeDesc,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'},
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : countryCode_code,
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
        Value             : central_completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : local_completionDate,
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
        Value                 : localApprover,
        ![@HTML5.CssDefaults] : {width : '8rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : modifiedBy,
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

annotate MroService.VendorNoti_U with @(UI : {LineItem : [
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'}
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCodeDesc,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'},
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : localManufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'}
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : localManufacturerCodeDesc,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'},
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : countryCode_code,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'}
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
        $Type                 : 'UI.DataField',
        Value                 : createdBy,
        ![@HTML5.CssDefaults] : {width : '7rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : approver,
        ![@HTML5.CssDefaults] : {width : '7rem'},
        ![@UI.Importance]     : #Medium
    }

]});

annotate MroService.VendorNoti_A with @(UI : {LineItem : [
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'}
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : manufacturerCodeDesc,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'}
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : localManufacturerCode,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'}
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : localManufacturerCodeDesc,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'}
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : countryCode_code,
        ![@UI.Importance]     : #High,
        ![@HTML5.CssDefaults] : {width : '8rem'}
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
        $Type                 : 'UI.DataField',
        Value                 : createdBy,
        ![@HTML5.CssDefaults] : {width : '7rem'},
        ![@UI.Importance]     : #Medium
    },
    {
        $Type             : 'UI.DataField',
        Value             : completionDate,
        ![@UI.Importance] : #Medium
    },
    {
        $Type                 : 'UI.DataField',
        Value                 : approver,
        ![@HTML5.CssDefaults] : {width : '7rem'},
        ![@UI.Importance]     : #Medium
    }

]});
