### Entity-Relationship Diagram (ERD)
This diagram is simplified to emphasize core business entities and their relationships.  See Relational Model for details.
```mermaid
erDiagram
    %% Portfolio
    PORTFOLIO ||--|{ TASK-ORDER : "funded by"
    TASK-ORDER ||--|{ CLIN : ""
    PORTFOLIO ||--|{ COSTS : ""
    COSTS }|--|| CLIN : ""
    COSTS }|--|| CLOUD-SERVICE-PROVIDER : "billed by"
    COSTS }|--|{ TASK-ORDER : "billed against"
    COSTS }|--|| ORGANIZATION : "incurred by"
    COSTS }|--|| AGENCY : ""
    
    %% Package
    ACQUISITION-PACKAGE ||--|| PORTFOLIO : "provisions"
    ACQUISITION-PACKAGE }|--|| ORGANIZATION : "supports mission of"
    ORGANIZATION ||--|{ AGENCY : ""
    ACQUISITION-PACKAGE ||--|| PERIOD-OF-PERFORMANCE : ""
    PACKAGE-DOCUMENT }|--|| ACQUISITION-PACKAGE : ""
    %% - funding
    ACQUISITION-PACKAGE ||--|| FUNDING-REQUIREMENT : ""
    FUNDING-REQUIREMENT ||--|{ FUNDING-PLAN : ""
    ACQUISITION-PACKAGE ||--|| FUNDING-REQUEST : ""
```

### Relational Model Diagram
This diagram depicts the relational model as implemented in ServiceNow tables in full detail.

```mermaid
erDiagram
    %% Portfolio
    ALERT {
        GUID sys_id PK
        Reference portfolio FK
        Reference task_order FK
        Reference clin FK
        Boolean active
        Choice alert_type "SPENDING_ACTUAL/SPENDING_FORECAST/TIME_REMAINING"
        String threshold_violation_amount
        DateTime last_notification_date
    }
    PORTFOLIO {
        GUID sys_id PK
        Reference acquisition_package FK
        Reference active_task_order FK
        Reference csp FK
        List pending_operators FK
        String csp_portfolio_id "from CSP"
        URL dashboard_link "deep link to CSP"
        DateTime last_updated
        String name
        Choice portfolio_funding_status "ON_TRACK/AT_RISK/FUNDING_AT_RISK/EXPIRED/DELINQUENT/EXPIRING_SOON"
        List portfolio_managers "to sys_user"
        List portfolio_viewers "to sys_user"
        Choice portfolio_status "ACTIVE/ARCHIVED/PROCESSING"
        Boolean provisioned
        DateTime provisioned_date
        String provisioning_failure_cause
        DateTime provisioning_request_date
    }
    TASK-ORDER {
        GUID sys_id PK
        Reference portfolio FK
        Reference acquisition_package FK
        Reference funding_plan FK
        Reference funding_request FK
        List clins FK
        String task_order_number
        Choice task_order_status "ON_TRACK/AT_RISK/EXPIRED/UPCOMING"
        Date pop_start_date
        Date pop_end_date
        Currency funds_total
        Currency funds_obligated
        Choice incrementally_funded "Y/N"
    }
    CLIN {
        GUID sys_id PK
        Reference task_order FK
        String clin_number
        Choice clin_status
        Choice idiq_clin
        Date pop_start_date
        Date pop_end_date
        Currency funds_total
        Currency funds_obligated
    }
    CLOUD-SERVICE-PROVIDER {    
        GUID sys_id PK
        String name
        Choice network
        String uri "change to URL type?"
        URL pricing_calculator_uri
    }
    COSTS {
        GUID sys_id PK
        Reference clin FK
        Reference csp FK
        Reference portfolio FK
        Reference organization FK
        Reference agency FK
        String task_order_number
        Boolean is_actual "actual/forecast"
        Currency value
        Date year_month "ignore day"
    }
    AGENCY {
        GUID sys_id PK
        Integer css_id "Contract Support System"
        String label
        String title
        String acronym
    }
    OPERATOR {
        GUID sys_id PK
        Reference portfolio FK
        String dod_id
        String email
        Boolean needs_reset
        Boolean provisioned
        DateTime provisioning_request_date
        DateTime provisioned_date
        String provisioning_failure_cause
        String added_by
    }
    PORTFOLIO ||--|{ TASK-ORDER : "funded by"
    TASK-ORDER ||--|{ CLIN : "has multiple (from EDA)"
    CLIN }|--|| TASK-ORDER : "part of"
    PORTFOLIO ||--|{ COSTS : "has (from CSPs)"
    PORTFOLIO ||--|{ SYS_USER : "portfolio managers and viewers"
    PORTFOLIO ||--|{ OPERATOR : "pending operators"
    COSTS }|--|| CLIN : ""
    COSTS }|--|| CLOUD-SERVICE-PROVIDER : "billed by"
    COSTS }|--|{ TASK-ORDER : "billed against"
    COSTS }|--|| ORGANIZATION : "incurred by"
    COSTS }|--|| AGENCY : ""
    ALERT }|--|| PORTFOLIO : ""
    ALERT }|--|| TASK-ORDER : ""
    ALERT }|--|| CLIN : "relates to"

    %% Package
    DITCO-CONTRACT-SPECIALIST {
        GUID sys_id PK
        Reference user FK "to sys_user"
        String first_name
        String last_name
        Boolean is_ko
        Integer css_id "Contract Support System"
    }
    IDIQ-CLIN {
        GUID sys_id PK
        Reference classification_level FK
        Choice contract "JWCC"
        Choice contract_type "FFP/T&M"
        String description
        String idiq_clin
    }
    ACQUISITION-PACKAGE {
        GUID sys_id PK
        Reference classification_level FK
        Reference contract_award FK
        Reference contract_considerations FK
        List contract_modifications FK
        Reference contract_type FK
        List contributors FK "to sys_user"
        List mission_owners FK "to sys_user"
        Reference current_contract_and_recurring_information FK
        Reference current_environment FK
        Reference ditco_ko FK
        Reference fair_opportunity FK
        List funding_plans FK
        Reference funding_request FK
        Reference funding_requirement FK
        Reference gfe_overview FK "TODO delete table"
        List idiq_clins FK
        Reference organization FK
        List pending_operator FK
        Reference period_of_performance FK
        Reference ditco_cs FK
        Reference project_overview FK
        Reference requirements_cost_estimate FK
        List secondary_reviewers FK "to sys_user; TBD"
        List selected_service_offerings FK
        Reference sensitive_information FK
        String number
        Choice package_status "DRAFT/WAITING_FOR_SIGNATURES/WAITING_FOR_TASK_ORDER/TASK_ORDER_AWARDED/ARCHIVED/DELETED"
        String css_pre_award_id "Contract Support System"
        String css_tracking_number "Contract Support System"
        String docusign_envelope_id
        Boolean edms_folder_created "Electronic Document Management System"
    }
    PROJECT-OVERVIEW {
        GUID sys_id PK
        String title
        Boolean emergency_declaration
        String scope
    }
    CONTACTS {
        GUID sys_id PK
        Reference rank_components FK
        Choice type "MISSION_OWNER/COR/ACOR/FINANCIAL_POC/JWCC_CONTRACTING_OFFICER"
        Boolean can_access_package "Y/N; defined here, referenced in many places"
        String salesforce_record_id
        Choice grade_civ "GS-01:15/SES"
        Choice role "CIVILIAN/CONTRACTOR/MILITARY"
        String dodaac
        String email
        String title
        Choice salutation "MR/MRS/MS/MISS/DR"
        String first_name
        String middle_name
        String last_name
        String suffix
        String formal_name "calculated value"
        PhoneNumber phone
        String phone_extension
        String phone_and_extension "calculated value"
        Boolean manually_entered
    }
    MILITARY-RANK {
        GUID sys_id PK
        String name
        String abbreviation
        Choice grade "E-1:9/O-1:10/W-1:5"
        Choice branch "AIR_FORCE/ARMY/COAST_GUARD/MARINE_CORPS/NAVY/SPACE_FORCE"
    }
    PROVISIONING-JOB {
        GUID sys_id PK
        Reference acquisition_package FK
        Choice job_type "ADD_PORTFOLIO/ADD_OPERATORS/ADD_FUNDING_SOURCE"
        String payload
        Choice status "NOT_STARTED/IN_PROGRESS/SUCCESS/FAILURE"
        String status_message
    }
    ORGANIZATION {
        GUID sys_id PK
        Reference agency FK
        String computed_name "calculated value"
        Choice disa_organization "> 50 options"
        String organization_name "when non-DISA"
        String dodaac
        Choice address_type "US/MILITARY/FOREIGN"
        String street_address_1
        String street_address_2
        String city
        String state
        String zip_code
        String country
    }
    SENSITIVE-INFORMATION {
        GUID sys_id PK
        String foia_full_name "Freedom of Information Act (FOIA) Coordinator"
        String foia_email
        String accessibility_reqs_508
        Choice section_508_sufficient
        String system_of_record_name
        Choice potential_to_be_harmful "if disclosed"
        Choice pii_present
        Choice baa_required "Business Associate Agreement"
        Choice foia_address_type "FOREIGN/MILITARY/US"
        String foia_state_province_state_code
        String foia_street_address_1
        String foia_street_address_2
        String foia_city_apo_fpo
        String foia_country
        String foia_zip_postal_code
        String work_to_be_performed
    }
    AWARD-HISTORY {
        GUID sys_id PK
        Choice contract_award_type "INITIAL_AWARD/MODIFICATION"
        Date effective_date
        Integer modification_order
    }
    CONTRACT-CONSIDERATIONS {
        GUID sys_id PK
        String conflict_of_interest_explanation
        NameValuePairs required_training_courses
        Choice potential_conflict_of_interest
        String packaging_shipping_other_explanation
        Boolean packaging_shipping_other
        Boolean packaging_shipping_none_apply
        Choice contractor_required_training
        Boolean contractor_provided_transfer
    }
    CONTRACT-TYPE {
        GUID sys_id PK
        String contract_type_justification "if FFP"
        Boolean firm_fixed_price
        Boolean time_and_materials
    }
    CURRENT-CONTRACT-INFORMATION-AND-RECURRING-INFORMATION {
        GUID sys_id PK
        String incumbent_contractor_name
        String contract_number
        Choice current_contract_exists
        Date contract_order_expiration_date
        String task_delivery_order_number
    }
    PERIOD-OF-PERFORMANCE {
        GUID sys_id PK
        Reference base_period FK
        List option_periods FK
        Date requested_pop_start_date
        Choice recurring_requirement
        Choice pop_start_request
        Choice time_frame
    }
    FAIR-OPPORTUNITY {
        GUID sys_id PK
        Choice exception_to_fair_opportunity
    }
    FUNDING-PLAN {
        GUID sys_id PK
        List remaining_amount_increments FK
        FileAttachment attachment
        String extension
        String file_name
        Currency initial_amount
        Currency remaining_amount
        Currency estimated_task_order_value
        String schedule_text "calculated value"
    }
    FUNDING-REQUEST {
        GUID sys_id PK
        Reference fs_form FK
        Reference mipr FK
        Choice funding_request_type "FS_FORM/MIPR"
    }
    FUNDING-REQUEST-FS-FORM {
        GUID sys_id PK
        FileAttachment fs_form_7600a_attachment
        String fs_form_7600a_filename
        FileAttachment fs_form_7600b_attachment
        String fs_form_7600b_filename
        String gt_c_number "General Terms and Condition"
        String order_number
        Choice use_g_invoicing
    }
    FUNDING-REQUEST-MIPR {
        GUID sys_id PK
        FileAttachment mipr_attachment
        String mipr_filename
        String mipr_number
    }
    FUNDING-REQUIREMENT {
        GUID sys_id PK
        Reference acquisition_package FK
        Reference funding_plan FK
        Reference funding_request FK
        Currency funds_obligated
        Currency funds_total
        Choice incrementally_funded
        Date pop_end_date
        Date pop_start_date
        String task_order_number
    }
    FUNDING-INCREMENT {
        GUID sys_id PK
        Currency amount
        String description
        Integer order
    }
    GFE-OVERVIEW {
        GUID sys_id PK
        String property_custodian_name
        String dpas_custodian_number "Defense Property Accountability System"
        Choice property_accountable
        Choice gfe_gfp_furnished
        String dpas_unit_identification_code
    }
    PERIOD {
        GUID sys_id PK
        Choice period_type "BASE/OPTION"
        Integer period_unit_count
        Choice period_unit "DAY/WEEK/MONTH/YEAR"
        Integer option_order
    }
    REQUIREMENTS-COST-ESTIMATE {
        GUID sys_id PK
        String surge_capabilities
        Integer contracting_office_fee_pct
    }
    SERVICE-OFFERING {
        GUID sys_id PK
        String description
        Choice service_offering_group
        Integer sequence
        String name
    }
    SELECTED-SERVICE-OFFERING {
        GUID sys_id PK
        List classification_instances FK
        List estimated_environment_instances FK
        Reference service_offering FK
        String other_service_offering
    }
    ESTIMATED-ENVIRONMENT-INSTANCE {
        Extends ENVIRONMENT-INSTANCE "inherits cols"
        GUID sys_id PK
        String dow_task_number
        Currency monthly_price
    }
    %% CURRENT-ENVIRONMENT-INSTANCE {
    %%     Extends ENVIRONMENT-INSTANCE "inherits cols"
    %% }
    %% COMPUTE-ENVIRONMENT-INSTANCE {
    %%     Extends ENVIRONMENT-INSTANCE "inherits cols"
    %% }
    %% DATABASE-ENVIRONMENT-INSTANCE {
    %%     Extends ENVIRONMENT-INSTANCE "inherits cols"
    %% }

    CLASSIFICATION-INSTANCE {
        GUID sys_id PK
        Reference classification_level FK
        List selected_periods FK
        String dow_task_number
        Currency monthly_price
        Choice need_for_entire_task_order_duration
        String usage_description
    }
    CLASSIFICATION-LEVEL {
        GUID sys_id PK
        Choice classification "U/S/TS"
        Choice impact_level "IL2/IL4/IL5/IL6"
        String display "calculated value"
    }
    ENVIRONMENT-INSTANCE {
        GUID sys_id PK
        Reference classification_level FK
        List selected_periods FK
        Choice need_for_entire_task_order_duration "true=select all periods"
        String instance_name
        Choice instance_location "CSP/ON_PREMISE/HYBRID"
        Choice csp_region "empty; TODO change to ref Region table"
        String operating_system_licensing
        Choice pricing_model "RESERVED/PAY_AS_YOU_GO"
        Date pricing_model_expiration
        Choice performance_tier "empty; TODO"
        Integer number_of_vcpus
        Integer memory_amount
        Choice memory_unit "GB/TB"
        Choice storage_type "empty; TODO"
        Integer storage_amount
        Choice storage_unit "GB/TB; TODO add PB"
        Integer data_egress_monthly_amount
        Choice data_egress_monthly_unit "GB/TB; TODO add PB"
    }
    CURRENT-ENVIRONMENT {
        GUID sys_id PK
        List environment_instances FK
        String additional_information
        Choice has_migration_documentation
        Choice has_system_documentation
        Boolean current_environment_exists
    }
    CURRENT-ENVIRONMENT-SYSTEM-DOCUMENTATION {
        GUID sys_id PK "TODO replace table with List column"
    }
    CURRENT-ENVIRONMENT-MIGRATION-DOCUMENTATION {
        GUID sys_id PK "TODO replace table with List column"
    }
    PACKAGE-DOCUMENT {
        GUID sys_id PK
        Reference acquisition_package FK
        Reference document_type FK
        FileAttachment file
        Choice document_status "DRAFT/READY_FOR_REVIEW/ACTION_REQUESTED/COMPLETED"
    }
    PACKAGE-DOCUMENT-TYPE {
        GUID sys_id PK
        Choice contract "JWCC"
        String name
        String abbreviation
        String file_name
        String edms_document_type
    }
    UPDATE-SALESFORCE-COR-ACOR-CONTACT {
        GUID sys_id PK
        String request_body
    }
    ATAT-CONFIGURATION {
        GUID sys_id PK
        String description
        String name
        String value
    }
    ENVIRONMENT-CONFIG {
        GUID sys_id PK
        URL endpoint
        String name
    }

    ACQUISITION-PACKAGE ||--|| SYS_USER : "MOs, contributors, reviewers"
    ACQUISITION-PACKAGE }|--|| CLASSIFICATION-LEVEL : ""
    ACQUISITION-PACKAGE ||--|| PORTFOLIO : "generates"
    ACQUISITION-PACKAGE ||--|| PROJECT-OVERVIEW : ""
    ACQUISITION-PACKAGE }|--|{ CONTACTS : "m2m table omitted"
    CONTACTS ||--o| MILITARY-RANK : "some have"
    ACQUISITION-PACKAGE }|--|| ORGANIZATION : "supports mission of"
    ORGANIZATION ||--|{ AGENCY : ""
    ACQUISITION-PACKAGE ||--|{ PROVISIONING-JOB : ""
    ACQUISITION-PACKAGE ||--|| SENSITIVE-INFORMATION : ""
    ACQUISITION-PACKAGE ||--|{ AWARD-HISTORY : "award and mods"
    ACQUISITION-PACKAGE ||--|| CONTRACT-CONSIDERATIONS : ""
    ACQUISITION-PACKAGE }|--|| CONTRACT-TYPE : ""
    ACQUISITION-PACKAGE ||--|| CURRENT-CONTRACT-INFORMATION-AND-RECURRING-INFORMATION : ""
    ACQUISITION-PACKAGE ||--|| PERIOD-OF-PERFORMANCE : ""
    ACQUISITION-PACKAGE ||--|| FAIR-OPPORTUNITY : ""
    ACQUISITION-PACKAGE ||--|| GFE-OVERVIEW : "TODO delete table"
    PERIOD-OF-PERFORMANCE ||--|{ PERIOD : "base and option"
    ACQUISITION-PACKAGE ||--|| REQUIREMENTS-COST-ESTIMATE : ""
    ACQUISITION-PACKAGE }|--|{ DITCO-CONTRACT-SPECIALIST : "KO and CS"
    DITCO-CONTRACT-SPECIALIST ||--|| SYS_USER : "KO and CS"
    ACQUISITION-PACKAGE }|--|{ IDIQ-CLIN : "contract specific"
    IDIQ-CLIN }|--|| CLASSIFICATION-LEVEL : ""
    ACQUISITION-PACKAGE ||--|{ OPERATOR : "pending operators; TODO refactor to save directly off portfolio"
    PACKAGE-DOCUMENT }|--|| ACQUISITION-PACKAGE : ""
    PACKAGE-DOCUMENT ||--|| PACKAGE-DOCUMENT-TYPE : ""
    PACKAGE-DOCUMENT ||--|| SYS_ATTACHMENT : "Package document"
    
    %% - DoW Performance Requirements
    ACQUISITION-PACKAGE ||--|| SELECTED-SERVICE-OFFERING : ""
    SELECTED-SERVICE-OFFERING }|--|{ SERVICE-OFFERING : ""
    SELECTED-SERVICE-OFFERING ||--|| CLASSIFICATION-INSTANCE : ""
    SELECTED-SERVICE-OFFERING ||--|{ ESTIMATED-ENVIRONMENT-INSTANCE : ""
    CLASSIFICATION-INSTANCE }|--|| CLASSIFICATION-LEVEL : ""
    CLASSIFICATION-INSTANCE ||--|{ PERIOD : ""
    %% - current environment
    ACQUISITION-PACKAGE ||--o| CURRENT-ENVIRONMENT : ""
    CURRENT-ENVIRONMENT ||--|{ ENVIRONMENT-INSTANCE : ""
    ENVIRONMENT-INSTANCE }|--|{ CLASSIFICATION-LEVEL : ""
    ENVIRONMENT-INSTANCE ||--|{ PERIOD : ""

    %% attempt to illustrate table inheritance
    ENVIRONMENT-INSTANCE ||--|| ESTIMATED-ENVIRONMENT-INSTANCE: "extends table"
    %% ENVIRONMENT-INSTANCE ||--|| CURRENT-ENVIRONMENT-INSTANCE: "extends table"
    %% ENVIRONMENT-INSTANCE ||--|| COMPUTE-ENVIRONMENT-INSTANCE: "extends table"
    %% ENVIRONMENT-INSTANCE ||--|| DATABASE-ENVIRONMENT-INSTANCE: "extends table"

    %% - funding
    ACQUISITION-PACKAGE ||--|| FUNDING-REQUIREMENT : ""
    FUNDING-REQUIREMENT ||--|{ FUNDING-PLAN : ""
    FUNDING-PLAN ||--o{ FUNDING-INCREMENT : ""
    FUNDING-PLAN ||--|| SYS_ATTACHMENT : "funding plan"
    ACQUISITION-PACKAGE ||--|{ FUNDING-PLAN : "TODO remove, refactor via funding requirement"
    ACQUISITION-PACKAGE ||--|| FUNDING-REQUEST : ""
    FUNDING-REQUEST ||--o{ FUNDING-REQUEST-FS-FORM : ""
    FUNDING-REQUEST-FS-FORM ||--|| SYS_ATTACHMENT : "7600A and 7600B"
    FUNDING-REQUEST ||--o| FUNDING-REQUEST-MIPR : ""
    FUNDING-REQUEST-MIPR ||--|| SYS_ATTACHMENT : "MIPR"
```
