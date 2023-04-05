### DAPPS Entity-Relationship Diagram (ERD)

DISA Acquisition Package Preparation System (DAPPS)
This diagram is simplified to emphasize core business entities and their relationships. See Relational Model for details.

```mermaid
erDiagram
    ACQUISITION-PACKAGE }|--|| ORGANIZATION : "supports mission of"
    ORGANIZATION ||--|{ AGENCY : ""
    ACQUISITION-PACKAGE ||--|| PERIOD-OF-PERFORMANCE : ""
    ACQUISITION-PACKAGE ||--|| FUNDING-REQUIREMENT : ""
    FUNDING-REQUIREMENT ||--|| FUNDING-PLAN : ""
    FUNDING-REQUIREMENT ||--|| FUNDING-REQUEST : ""
```

### ATAT Entity-Relationship Diagram (ERD)

Account Tracking & Automation Tool (ATAT)
This diagram is simplified to emphasize core business entities and their relationships. See Relational Model for details.

```mermaid
erDiagram
    PORTFOLIO ||--|| ACQUISITION-PACKAGE : "defines requirements"
    PORTFOLIO ||--|{ TASK-ORDER : "funded by"
    TASK-ORDER ||--|{ CLIN : "from EDA"
    PORTFOLIO ||--|{ COSTS : "incurs"
    ENVIRONMENT ||--|| PORTFOLIO : ""
    ENVIRONMENT ||--|| CLOUD-SERVICE-PROVIDER : "provisioned by"
    COSTS }|--|| CLOUD-SERVICE-PROVIDER : "billed by"
    COSTS }|--|{ TASK-ORDER : "billed against"
    COSTS }|--|| ORGANIZATION : "incurred by"
    ORGANIZATION ||--|{ AGENCY : ""
    OPERATOR ||--|| ENVIRONMENT : "administers"
```

### Relational Model Diagram

This diagram depicts the relational model as implemented in ServiceNow tables in full detail.

```mermaid
erDiagram
    %% Portfolio
    ALERT {
        GUID sys_id PK
        Reference portfolio FK "to Portfolio"
        Reference task_order FK "to Task Order"
        Reference clin FK "to CLIN"
        Boolean active
        Choice alert_type "SPENDING_ACTUAL/SPENDING_FORECAST/TIME_REMAINING"
        String threshold_violation_amount
        DateTime last_notification_date
    }
    PORTFOLIO {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
        Reference active_task_order FK "to Task Order"
        List portfolio_managers FK "to sys_user"
        List portfolio_viewers FK "to sys_user"
        String name
        String description
        DateTime last_updated
        Choice portfolio_funding_status "ON_TRACK/AT_RISK/FUNDING_AT_RISK/EXPIRED/DELINQUENT/EXPIRING_SOON"
        Choice portfolio_status "PROCESSING/PROVISIONING_ISSUE/ACTIVE/ARCHIVED"
        
        List pending_operators FK "(column INACTIVE)"
        URL dashboard_link "(column INACTIVE)"
        String csp_portfolio_id "(column INACTIVE)"
        Reference csp FK "(column INACTIVE)"
        Boolean provisioned "(column INACTIVE)"
        DateTime provisioned_date "(column INACTIVE)"
        String provisioning_failure_cause "(column INACTIVE)"
        DateTime provisioning_request_date "(column INACTIVE)"
    }
    TASK-ORDER {
        GUID sys_id PK
        Reference portfolio FK "to Portfolio"
        List clins FK "to CLIN"
        String task_order_number
        Choice task_order_status "ON_TRACK/AT_RISK/EXPIRED/UPCOMING"
        Date pop_start_date
        Date pop_end_date
        Reference acquisition_package FK "(column INACTIVE)"
        Reference funding_plan FK "(column INACTIVE)"
        Reference funding_request FK "(column INACTIVE)"
        Currency funds_total "(column INACTIVE)"
        Currency funds_obligated "(column INACTIVE)"
        Choice incrementally_funded "(column INACTIVE)"
    }
    CLIN {
        GUID sys_id PK
        Reference task_order FK "to Task Order"
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
        String uri "TODO change to URL type?"
        URL pricing_calculator_uri
    }
    COSTS {
        GUID sys_id PK
        Reference clin FK "to CLIN"
        Reference csp FK "to Cloud Service Provider"
        Reference portfolio FK "to Portfolio"
        Reference organization FK "to Organization"
        Reference agency FK "to Agency"
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
    ENVIRONMENT {
        GUID sys_id PK
        Reference csp FK "to Cloud Service Provider"
        List pending_operators FK "to Operator"
        Reference portfolio FK "to Portfolio"
        String name
        Choice environment_status "PROCESSING/PROVISIONING_ISSUE/PROVISIONED/ARCHIVED"
        String csp_portfolio_id
        URL dashboard_link "deep link to CSP"
        Boolean provisioned
        DateTime provisioned_date "for provisioning duration"
        String provisioning_failure_cause
        DateTime provisioning_request_date
    }
    OPERATOR {
        GUID sys_id PK
        Reference environment FK "to Environment"
        String dod_id
        String email
        Boolean needs_reset
        Boolean provisioned
        DateTime provisioning_request_date
        DateTime provisioned_date "for provisioning duration"
        String provisioning_failure_cause
        String added_by
        Reference portfolio FK "(column INACTIVE)"
    }
    PORTFOLIO ||--|{ TASK-ORDER : "funded by"
    TASK-ORDER ||--|{ CLIN : "has (from EDA)"
    CLIN }|--|| TASK-ORDER : "part of"
    PORTFOLIO ||--|{ COSTS : "has (from CSPs)"
    PORTFOLIO ||--|{ SYS_USER : "portfolio managers"
    PORTFOLIO ||--o{ SYS_USER : "portfolio viewers"
    ENVIRONMENT ||--|{ OPERATOR : "pending"
    OPERATOR ||--|| ENVIRONMENT : "administers"
    ENVIRONMENT ||--|| PORTFOLIO : "belongs to"
    ENVIRONMENT ||--|| CLOUD-SERVICE-PROVIDER : "provisioned by"
    PROVISIONING-JOB ||--|| ENVIRONMENT : "request to provision"
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
        Reference classification_level FK "to Classification Level"
        Choice contract "JWCC"
        Choice contract_type "FFP/T&M"
        String description
        String idiq_clin
    }
    ACQUISITION-PACKAGE {
        GUID sys_id PK
        Reference contract_award FK "to Award History"
        Reference contract_considerations FK "to Contract Considerations"
        List contract_modifications FK "to Award History"
        Reference contract_type FK "to Contract Type"
        List contributors FK "to sys_user"
        List mission_owners FK "to sys_user"
        Reference current_contract_and_recurring_information FK "to Current Contract Information And Recurring Information"
        Reference current_environment FK "to Current Environment"
        Reference ditco_ko FK "to DITCO Contract Specialist"
        Reference evaluation_plan FK "to Evaluation Plan"
        Reference fair_opportunity FK "to Fair Opportunity"
        List funding_plans FK "to Funding Plan"
        Reference funding_request FK "to Funding Request"
        Reference funding_requirement FK "to Funding Requirement"
        Reference gfe_overview FK "TODO delete table"
        List idiq_clins FK "to IDIQ CLIN"
        Reference organization FK "to Organization"
        List pending_operator FK "to Operator"
        Reference period_of_performance FK "to Period of Performance"
        Reference ditco_cs FK "to DITCO Contract Specialist"
        Reference project_overview FK "to Project Overview"
        Reference requirements_cost_estimate FK "(column INACTIVE)"
        List secondary_reviewers FK "to sys_user"
        List selected_service_offerings FK "(column INACTIVE)"
        Reference sensitive_information FK "to Sensitive Information"
        Reference cor FK "to Contacts"
        Reference acor FK "to Contacts"
        Reference primary_contact FK "to Contacts"
        String number
        Choice package_status "DRAFT/WAITING_FOR_SIGNATURES/WAITING_FOR_TASK_ORDER/TASK_ORDER_AWARDED/ARCHIVED/DELETED"
        String css_pre_award_id "Contract Support System"
        String css_tracking_number "Contract Support System"
        String docusign_envelope_id
        Boolean edms_folder_created "Electronic Document Management System"
        Choice docgen_job_status "references Provisioning Job.status"
        Choice contracting_shop "DITCO/OTHER"
        String j_a_and_mrr_filenames "e.g. document1.docx,document2.pdf"
    }
    ARCHITECTURAL-DESIGN-REQUIREMENT {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
        List data_classification_levels FK "to Classification Level"
        String statement
        String applications_needing_design
        String external_factors
        Choice source "DOW/CURRENT_ENVIRONMENT"
        String dow_task_number
        Choice needs_architectural_design_services "Y/N"
    }
    PROJECT-OVERVIEW {
        GUID sys_id PK
        String title
        Boolean emergency_declaration
        String scope
    }
    CONTACTS {
        GUID sys_id PK
        Reference rank_components FK "to Military Rank"
        Choice type "MISSION_OWNER/COR/ACOR/FINANCIAL_POC/JWCC_CONTRACTING_OFFICER"
        Boolean can_access_package "Y/N; defined here"
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
        Reference environment FK "to Environment"
        Choice job_type "ADD_PORTFOLIO/ADD_OPERATORS/ADD_FUNDING_SOURCE"
        String payload
        Choice status "NOT_STARTED/IN_PROGRESS/SUCCESS/FAILURE"
        String status_message
        String csp_job_id "provided by CSP"
        String hoth_job_id "provided by ATAT"
        Reference acquisition_package FK "(column INACTIVE)"
    }
    ORGANIZATION {
        GUID sys_id PK
        Reference agency FK "to Agency"
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
        String display "calculated value"
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
        Reference base_period FK "to Period"
        List option_periods FK "to Period"
        Date requested_pop_start_date
        Choice recurring_requirement
        Choice pop_start_request
        Choice time_frame
    }
    EVALUATION-PLAN {
        GUID sys_id PK
        List standard_differentiators FK "to Eval Plan Differentiator"
        List standard_specifications FK "to Eval Plan Assessment Area"
        Choice source_selection "NO_TECH_PROPOSAL/TECH_PROPOSAL/SET_LUMP_SUM/EQUAL_SET_LUMP_SUM"
        Choice method "LPTA/BVTO/BEST_USE/LOWEST_RISK"
        Choice has_custom_specifications "Y/N"
        String custom_specifications
        String custom_differentiators
    }
    EVAL-PLAN-DIFFERENTIATOR {
        GUID sys_id PK
        String name
        String description
        Integer sequence
    }
    EVAL-PLAN-ASSESSMENT-AREA {
        GUID sys_id PK
        String name
        String description
        Integer sequence
    }
    FAIR-OPPORTUNITY {
        GUID sys_id PK
        Choice exception_to_fair_opportunity
    }
    FUNDING-PLAN {
        GUID sys_id PK
        List remaining_amount_increments FK "to Funding Increment"
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
        Reference fs_form FK "to Funding Request FS Form"
        Reference mipr FK "to Funding Request MIPR"
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
        Reference acquisition_package FK "to Acquisition Package"
        Reference funding_plan FK "to Funding Plan"
        Reference funding_request FK "to Funding Request"
        Reference financial_poc FK "to Contacts"
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
        Reference acquisition_package FK "to Acquisition Package"
        Choice architectural_design_current_environment_option "references Requirements Cost Estimate.optimize_replicate_option"
        String architectural_design_current_environment_estimated_values "stringified json w/ {'<period_sys_id>':<price estimate>} pairs"
        Choice architectural_design_performance_requirements_option "reference Requirements Cost Estimate.optimize_replicate_option"
        String architectural_design_performance_requirements_estimated_values "stringified json w/ {'<period_sys_id>':<price estimate>} pairs"
        Choice contracting_office_other_charges_fee "(column INACTIVE)"
        Integer contracting_office_other_fee_percentage "(column INACTIVE)"
        Integer contracting_office_fee_pct "(column INACTIVE)"
        String cost_estimate_description "(column INACTIVE)"
        Choice has_dow_and_pop "Y/N"
        Choice optimize_replicate_option "SINGLE/MULTIPLE"
        String optimize_replicate_estimated_values "stringified json w/ {'<period_sys_id>':<price estimate>} pairs"
        Choice previous_cost_estimate_comparison_option "(column INACTIVE)"
        Integer previous_cost_estimate_comparison_percentage "(column INACTIVE)"
        Choice surge_requirement_capabilities "Y/N"
        Integer surge_requirement_capacity
        String surge_capabilities "(column INACTIVE)"
        Choice how_est_dev_contracting_office_other_charges_fee "Y/N"
        Integer how_est_dev_contracting_office_other_fee_percentage
        Choice how_est_dev_prev_cost_estimate_comp_option "MORE_THAN/LESS_THAN/SAME"
        Integer how_est_dev_prev_cost_estimate_comp_percentage
        String how_est_dev_tools_used "CSV list"
        String how_est_dev_other_tools_used
        String how_est_dev_cost_estimate_description
        Choice travel_option "references Requirements Cost Estimate.optimize_replicate_option"
        String travel_estimated_values "CSV list"
    }
    TRAINING-ESTIMATE {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
        Reference cloud_support_environment_instance FK "to Cloud Support Environment Instance"
        Reference requirements_cost_estimate FK "(column INACTIVE)"
        Choice training_unit "PER_PERSON/PER_CLASS/ANNUAL_SUBSCRIPTION/MONTHLY_SUBSCRIPTION"
        Choice subscription_type "(column INACTIVE)"
        Currency estimated_price_per_training_unit
        Choice training_option "references Requirements Cost Estimate.optimize_replicate_option"
        String training_estimated_values "CSV list"
        String dow_task_number
    }
    SERVICE-OFFERING {
        GUID sys_id PK
        String description
        Choice service_offering_group "ADVISORY_ASSISTANCE/APPLICATIONS/COMPUTE/DATABASE/DEVELOPER_TOOLS/DOCUMENTATION_SUPPORT/EDGE_COMPUTING/GENERAL_CLOUD_SUPPORT/GENERAL_XAAS/HELP_DESK_SERVICES/IOT/MACHINE_LEARNING/NETWORKING/PORTABILITY_PLAN/SECURITY/STORAGE/TRAINING"
        Integer sequence
        String name
        Choice offering_type "XAAS_SERVICE/CLOUD_SUPPORT"
    }
    SELECTED-SERVICE-OFFERING {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
        List classification_instances FK "to Classification Instance"
        List estimated_environment_instances FK "to Estimated Environment Instance"
        Reference service_offering FK "to Service Offering"
        Reference architectural_design_requirement FK "(column INACTIVE)"
        String other_service_offering
        Currency cost_estimate "(column INACTIVE)"
        String igce_title "(column INACTIVE)"
        String igce_description "(column INACTIVE)"
    }
    ESTIMATED-ENVIRONMENT-INSTANCE {
        Extends ENVIRONMENT-INSTANCE "inherits cols"
        GUID sys_id PK
        String dow_task_number
        Currency monthly_price
    }
    CURRENT-ENVIRONMENT-INSTANCE {
        Extends ENVIRONMENT-INSTANCE "inherits cols"
        List deployed_regions FK "to Region"
        Choice current_usage_description "EVEN_USAGE/IRREGULAR_USAGE"
        Choice is_traffic_spike_event_based "Y/N"
        Choice is_traffic_spike_period_based "Y/N"
        String traffic_spike_event_description
        String traffic_spike_period_description
        String users_per_region "stringified json w/ {'<region_sys_id>':<user count>} pairs"
        Choice environment_type "references Compute Environment Instance.environment_type"
        Choice operating_environment "references Compute Environment Instance.operating_environment"
        String anticipated_need_usage
        String additional_information
    }
    COMPUTE-ENVIRONMENT-INSTANCE {
        Extends ENVIRONMENT-INSTANCE "inherits cols"
        GUID sys_id PK
        Choice environment_type "DEV_TEST/PRE_PROD/PROD_STAGING/COOP_DISASTER_RECOVERY"
        Choice operating_environment "VIRTUAL/CONTAINERS/SERVERLESS/END_USER_COMPUTING_VIRTUAL_DESKTOP"
    }
    DATABASE-ENVIRONMENT-INSTANCE {
        Extends ENVIRONMENT-INSTANCE "inherits cols"
        GUID sys_id PK
        Choice database_type "ANALYTICAL/TRANSACTIONAL/GRAPH/RELATIONAL/OTHER"
        String database_type_other
        Choice database_licensing "TRANSFER_EXISTING/NEW"
        String network_performance
    }
    CLOUD-SUPPORT-ENVIRONMENT-INSTANCE {
        Extends ENVIRONMENT-INSTANCE "inherits cols"
        GUID sys_id PK
        Choice personnel_onsite_access "Y/N"
        Choice ts_contractor_clearance_type "(column INACTIVE)"
        Choice service_type "references Service Offering.service_offering_group"
        String training_requirement_title
        Choice training_format "ONSITE_INSTRUCTOR_CONUS/ONSITE_INSTRUCTOR_OCONUS/VIRTUAL_INSTRUCTOR/VIRTUAL_SELF_LED/NO_PREFERENCE"
        Integer personnel_requiring_training
        Choice training_facility_type "GOVERNMENT_FACILITY/NON_GOVERNMENT_FACILITY"
        String training_location
        String training_time_zone
        Choice can_train_in_unclass_env "Y/N"
    }
    STORAGE-ENVIRONMENT-INSTANCE {
        Extends ENVIRONMENT-INSTANCE "inherits cols"
        GUID sys_id PK
    }
    GENERAL-XAAS-ENVIRONMENT-INSTANCE {
        Extends ENVIRONMENT-INSTANCE "inherits cols"
        GUID sys_id PK
    }
    CLASSIFICATION-INSTANCE {
        GUID sys_id PK
        Reference classification_level FK "to Classification Level"
        List classified_information_types FK "to Classified Information Type"
        List selected_periods FK "to Period"
        String dow_task_number "(column INACTIVE)"
        Currency monthly_price "(column INACTIVE)"
        Choice need_for_entire_task_order_duration
        String usage_description
        Choice type_of_mobility "MAN_PORTABLE/MODULAR/OTHER/NO_PREFERENCE"
        String type_of_mobility_other
        Choice type_of_delivery "SHIPPED/PICK_UP"
    }
    CLASSIFICATION-LEVEL {
        GUID sys_id PK
        Choice classification "U/S/TS"
        Choice impact_level "IL2/IL4/IL5/IL6"
        String display "calculated value"
    }
    CLASSIFIED-INFORMATION-TYPE {
        GUID sys_id PK
        String name
        String description
        Integer sequence
    }
    REGION {
        GUID sys_id PK
        String description
        Choice group "CONUS/OCONUS"
        String name
        Integer sequence
    }
    ENVIRONMENT-INSTANCE {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
        Reference classification_level FK "to Classification Level"
        List classified_information_types FK "to Classified Information Type"
        List selected_periods FK "to Period"
        Reference region FK "to Region"
        Choice need_for_entire_task_order_duration "true=select all periods"
        String instance_name
        Choice instance_location "CLOUD/ON_PREM"
        Integer number_of_instances "how many currently / are needed"
        String operating_system
        String licensing
        Choice pricing_model "PREPAID/PAY_AS_YOU_GO"
        Date pricing_model_expiration
        Choice performance_tier "GENERAL/COMPUTE/MEMORY/STORAGE"
        Integer number_of_vcpus
        Integer processor_speed
        Integer memory_amount
        Choice memory_unit "references Environment Instance.storage_unit"
        Choice storage_type "BLOCK/OBJECT/FILE/ARCHIVE"
        Integer storage_amount
        Choice storage_unit "GB/TB/PB"
        Integer data_egress_monthly_amount
        Choice data_egress_monthly_unit "references Environment Instance.storage_unit"
        Choice operating_system_licensing "TRANSFER_EXISTING/NEW"
        String anticipated_need_or_usage
        String usage_description
        Integer instance_number
        Currency cost_estimate "(column INACTIVE)"
        String igce_title "(column INACTIVE)"
        String igce_description "(column INACTIVE)"
    }
    CURRENT-ENVIRONMENT {
        GUID sys_id PK
        List env_instances FK "to Current Environment Instance"
        List system_documentation FK "to sys_attachment"
        List env_classifications_cloud FK "to Classification Level"
        List env_classifications_onprem FK "to Classification Level"
        List migration_documentation FK "to sys_attachment"
        Reference architectural_design_requirement FK "(column INACTIVE)"
        Choice current_environment_exists "Y/N"
        Choice has_system_documentation "Y/N"
        Choice has_migration_documentation "Y/N"
        Choice env_location "CLOUD/ON_PREM/HYBRID"
        Choice current_environment_replicated_optimized "YES_REPLICATE/YES_OPTIMIZE/NO"
        String statement_replicated_optimized
        Choice additional_growth "Y/N"
        Integer anticipated_yearly_additional_capacity
        Choice has_phased_approach "Y/N"
        String phased_approach_schedule
        Choice needs_architectural_design_services "Y/N"
        String dow_task_number
    }
    PACKAGE-DOCUMENT {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
        Reference document_type FK "to Package Document Type"
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
    PACKAGE-DOCUMENTS-SIGNED {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
    }
    PACKAGE-DOCUMENTS-UNSIGNED {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
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
    SELECTED-CLASSIFICATION-LEVEL {
        GUID sys_id PK ""
        Reference acquisition_package FK "to Acquisition Package"
        Reference classification_level FK "to Classification Level"
        List classified_information_types FK "to Classified Information Type"
        String users_per_region "stringified json w/ {'<region_sys_id>':<user count>} pairs"
        Choice increase_in_users "Y/N"
        Choice user_growth_estimate_type "SINGLE/MULTIPLE"
        String user_growth_estimate_percentage "stringified json w/ {'<period_sys_id>':<percentage>} pairs"
        Integer data_egress_monthly_amount
        Choice data_egress_monthly_unit "references Environment Instance.storage_unit"
        Choice data_increase "Y/N"
        Choice data_growth_estimate_type "references Selected Classification Level.user_growth_estimate_type"
        String data_growth_estimate_percentage "stringified json w/ {'<period_sys_id>':<percentage>} pairs"
    }
    SECURITY-REQUIREMENT  {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
        List advisory_services_secret FK "to Classified Information Type"
        List advisory_services_top_secret FK "to Classified Information Type"
        Choice service_offering_group "references Service Offering.service_offering_group"
        Choice ts_contractor_clearance_type "TS/TS_SCI"
    }
    TRAVEL-REQUIREMENT  {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
        List selected_periods FK "to Period"
        String trip_location
        Integer duration_in_days
        Integer number_of_travelers
        Integer number_of_trips
        String dow_task_number
    }
    CROSS-DOMAIN-SOLUTION  {
        GUID sys_id PK
        Reference acquisition_package FK "to Acquisition Package"
        List selected_periods FK "to Period"
        Choice need_for_entire_task_order_duration "Y/N"
        Choice cross_domain_solution_required "Y/N"
        String projected_file_stream_type
        String anticipated_need_or_usage
        String traffic_per_domain_pair "stringified json w/ {'<domain_pair_sys_id>':<monthly traffic estimate in GB>} pairs"
    }
    DOMAIN-PAIR {
        GUID sys_id PK "used to represent unidirectional traffic flow from domain1 to domain2"
        Choice domain1 "references Classification Level.classification"
        Choice domain2 "references Classification Level.classification"
        String value "calculated value; e.g. U_TO_S"
        String label "calculated value; e.g. Unclassified to Secret"
    }
    IGCE-ESTIMATE {
        GUID sys_id PK "Estimates are based on instance data"
        Reference acquisition_package FK "to Acquisition Package"
        Reference selected_service_offering FK "(column INACTIVE)"
        Reference environment_instance FK "instance option; to Environment Instance"
        Reference classification_instance FK "instance option; to Classification Instance"
        Reference cross_domain_solution FK "instance option; to Cross Domain Solution"
        Reference classification_level FK "to Classification Level"
        Choice contract_type "FFP/T&M/TBD"
        String title "composed from instance data"
        String description "composed from instance data"
        Currency unit_price
        Integer quantity "(column INACTIVE)"
        String unit_quantity "stringified json w/ {'<period_sys_id>':<quantity of unit>} pairs"
        Choice unit "EACH/MONTH/PEOPLE/PERIOD/SESSIONS/YEAR"
        String dow_task_number
        Choice idiq_clin_type "CLOUD/CLOUD_SUPPORT"
        String cross_domain_pair "name of a Domain Pair"
    }

    ACQUISITION-PACKAGE ||--|| SYS_USER : "MOs, contributors, reviewers"
    ACQUISITION-PACKAGE ||--|| PORTFOLIO : "generates"
    ACQUISITION-PACKAGE ||--|| PROJECT-OVERVIEW : ""
    ACQUISITION-PACKAGE ||--|{ CONTACTS : ""
    CONTACTS ||--o| MILITARY-RANK : "military have"
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
    ACQUISITION-PACKAGE }|--|{ DITCO-CONTRACT-SPECIALIST : "KO and CS"
    DITCO-CONTRACT-SPECIALIST ||--|| SYS_USER : "KO and CS"
    ACQUISITION-PACKAGE }|--|{ IDIQ-CLIN : "contract specific"
    IDIQ-CLIN }|--|| CLASSIFICATION-LEVEL : ""
    ACQUISITION-PACKAGE ||--|{ OPERATOR : "pending operators; TODO refactor to save directly off portfolio"
    PACKAGE-DOCUMENT }|--|| ACQUISITION-PACKAGE : ""
    PACKAGE-DOCUMENT ||--|| PACKAGE-DOCUMENT-TYPE : ""
    PACKAGE-DOCUMENT ||--|| SYS_ATTACHMENT : "Package document"
    PACKAGE-DOCUMENTS-SIGNED }|--|| ACQUISITION-PACKAGE : ""
    PACKAGE-DOCUMENTS-UNSIGNED }|--|| ACQUISITION-PACKAGE : ""
    SELECTED-CLASSIFICATION-LEVEL }|--|| ACQUISITION-PACKAGE : ""
    SELECTED-CLASSIFICATION-LEVEL ||--|| CLASSIFICATION-LEVEL : ""
    SELECTED-CLASSIFICATION-LEVEL ||--o{ CLASSIFIED-INFORMATION-TYPE : "S and TS only"
    ARCHITECTURAL-DESIGN-REQUIREMENT }|--|| ACQUISITION-PACKAGE : ""
    ARCHITECTURAL-DESIGN-REQUIREMENT ||--|| CLASSIFICATION-LEVEL : ""
    SECURITY-REQUIREMENT }|--|| ACQUISITION-PACKAGE : ""
    SECURITY-REQUIREMENT ||--o{ CLASSIFIED-INFORMATION-TYPE : ""
    TRAVEL-REQUIREMENT }|--|| ACQUISITION-PACKAGE : ""
    TRAVEL-REQUIREMENT ||--|{ PERIOD : ""
    CROSS-DOMAIN-SOLUTION }|--|| ACQUISITION-PACKAGE : ""
    CROSS-DOMAIN-SOLUTION ||--|{ PERIOD : ""
    IGCE-ESTIMATE }|--|| ACQUISITION-PACKAGE : ""
    IGCE-ESTIMATE ||--|| SELECTED-SERVICE-OFFERING : ""
    IGCE-ESTIMATE ||--|| CLASSIFICATION-INSTANCE : ""
    IGCE-ESTIMATE ||--|| CROSS-DOMAIN-SOLUTION : ""
    REQUIREMENTS-COST-ESTIMATE }|--|| ACQUISITION-PACKAGE : ""
    TRAINING-ESTIMATE }|--|| ACQUISITION-PACKAGE : ""
    TRAINING-ESTIMATE }|--|| CLOUD-SUPPORT-ENVIRONMENT-INSTANCE : ""

    %% DoW Performance Requirements
    SELECTED-SERVICE-OFFERING }|--|| ACQUISITION-PACKAGE : ""
    SELECTED-SERVICE-OFFERING }|--|{ SERVICE-OFFERING : ""
    SELECTED-SERVICE-OFFERING ||--|| CLASSIFICATION-INSTANCE : ""
    SELECTED-SERVICE-OFFERING ||--|{ ESTIMATED-ENVIRONMENT-INSTANCE : ""
    CLASSIFICATION-INSTANCE }|--|| CLASSIFICATION-LEVEL : ""
    CLASSIFICATION-INSTANCE ||--o{ CLASSIFIED-INFORMATION-TYPE : "S and TS only"
    CLASSIFICATION-INSTANCE ||--|{ PERIOD : ""
    %% base table
    ENVIRONMENT-INSTANCE }|--|| ACQUISITION-PACKAGE : ""
    ENVIRONMENT-INSTANCE }|--|{ CLASSIFICATION-LEVEL : ""
    ENVIRONMENT-INSTANCE ||--o{ CLASSIFIED-INFORMATION-TYPE : "S and TS only"
    ENVIRONMENT-INSTANCE ||--|{ PERIOD : ""
    ENVIRONMENT-INSTANCE ||--|| REGION : ""
    %% attempt to illustrate table inheritance
    ENVIRONMENT-INSTANCE ||--|| ESTIMATED-ENVIRONMENT-INSTANCE: "extended by"
    ENVIRONMENT-INSTANCE ||--|| CURRENT-ENVIRONMENT-INSTANCE: "extended by"
    ENVIRONMENT-INSTANCE ||--|| DATABASE-ENVIRONMENT-INSTANCE: "extended by"
    ENVIRONMENT-INSTANCE ||--|| COMPUTE-ENVIRONMENT-INSTANCE: "extended by"
    ENVIRONMENT-INSTANCE ||--|| STORAGE-ENVIRONMENT-INSTANCE: "extended by"
    ENVIRONMENT-INSTANCE ||--|| GENERAL-XAAS-ENVIRONMENT-INSTANCE: "extended by"
    ENVIRONMENT-INSTANCE ||--|| CLOUD-SUPPORT-ENVIRONMENT-INSTANCE: "extended by"
    %% current environment
    ACQUISITION-PACKAGE ||--o| CURRENT-ENVIRONMENT : ""
    CURRENT-ENVIRONMENT ||--|{ CURRENT-ENVIRONMENT-INSTANCE : ""
    CURRENT-ENVIRONMENT-INSTANCE }|--o{ REGION: "deployed to"
    CURRENT-ENVIRONMENT ||--o{ SYS_ATTACHMENT : "system and migration docs"
    CURRENT-ENVIRONMENT ||--|{ CLASSIFICATION-LEVEL : "environs and data"
    %% evaluation plan
    ACQUISITION-PACKAGE ||--|| EVALUATION-PLAN : ""
    EVALUATION-PLAN ||--o{ EVAL-PLAN-DIFFERENTIATOR : "BVTO only"
    EVALUATION-PLAN ||--o{ EVAL-PLAN-ASSESSMENT-AREA : "SET_LUMP_SUM only"
    %% funding
    ACQUISITION-PACKAGE ||--|| FUNDING-REQUIREMENT : ""
    FUNDING-REQUIREMENT ||--|{ FUNDING-PLAN : ""
    FUNDING-REQUIREMENT ||--|| CONTACTS : ""
    FUNDING-PLAN ||--o{ FUNDING-INCREMENT : ""
    FUNDING-PLAN ||--|| SYS_ATTACHMENT : "funding plan"
    ACQUISITION-PACKAGE ||--|{ FUNDING-PLAN : "TODO remove, refactor via funding requirement"
    ACQUISITION-PACKAGE ||--|| FUNDING-REQUEST : ""
    FUNDING-REQUEST ||--o{ FUNDING-REQUEST-FS-FORM : ""
    FUNDING-REQUEST-FS-FORM ||--|| SYS_ATTACHMENT : "7600A and 7600B"
    FUNDING-REQUEST ||--o| FUNDING-REQUEST-MIPR : ""
    FUNDING-REQUEST-MIPR ||--|| SYS_ATTACHMENT : "MIPR"
```
